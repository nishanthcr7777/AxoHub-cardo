/**
 * Minimal Hydra Client - Direct WebSocket connection
 */

interface HydraCommit {
    id: string
    packageId: string
    version: string
    sourceCode: string
    sourceCID: string
    metadataCID: string
    message: string
    author: string
    timestamp: number
    commitHash: string
    status: 'hydra_pending' | 'pushed_to_l1'
    linesAdded?: number
    linesRemoved?: number
}

class HydraClient {
    private ws: WebSocket | null = null
    private headId: string | null = null
    private lastGreetings: any | null = null

    constructor(private url: string = process.env.NEXT_PUBLIC_HYDRA_WS_URL || 'ws://localhost:5001') { }

    async connect(): Promise<void> {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) return

        return new Promise((resolve, reject) => {
            console.log('Connecting to Hydra node at', this.url)
            this.ws = new WebSocket(this.url)

            this.ws.addEventListener('message', (event) => {
                try {
                    const msg = JSON.parse(event.data)
                    // Fix logging to avoid undefined tag spam
                    if (msg.tag) {
                        console.log('Hydra Message Received:', msg.tag)
                    } else {
                        console.log('Hydra Message (no tag):', msg)
                    }

                    if (msg.tag === 'Greetings') {
                        this.lastGreetings = msg
                        if (msg.hydraHeadId) {
                            this.headId = msg.hydraHeadId
                        }
                    }
                } catch (e) {
                    console.log('Raw Hydra Message:', event.data)
                }
            })

            this.ws.onopen = () => {
                console.log('Connected to Hydra node')
                resolve()
            }

            this.ws.onerror = (err) => {
                console.error('Hydra connection failed:', err)
                reject(new Error('Failed to connect to Hydra node.'))
            }
        })
    }

    private async waitForGreetings(): Promise<any> {
        if (this.lastGreetings) return this.lastGreetings

        console.log('Waiting for Greetings...')
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.ws?.removeEventListener('message', listener)
                reject(new Error('Timeout waiting for Greetings'))
            }, 5000)

            const listener = (event: MessageEvent) => {
                try {
                    const msg = JSON.parse(event.data)
                    if (msg.tag === 'Greetings') {
                        clearTimeout(timeout)
                        this.ws?.removeEventListener('message', listener)
                        resolve(msg)
                    }
                } catch (e) { }
            }
            this.ws?.addEventListener('message', listener)
        })
    }

    async openHead(): Promise<{ headId: string, status: 'Initializing' | 'Open' }> {
        await this.connect()

        // 1. Check Initial State via Greetings
        let greetings;
        try {
            greetings = await this.waitForGreetings()
            console.log('Greetings received. Status:', greetings.headStatus)
        } catch (e) {
            console.warn('Failed to wait for Greetings, proceeding anyway...', e)
        }

        // 2. Handle based on status
        if (greetings) {
            if (greetings.headStatus === 'Open') {
                console.log('Head is already Open. Ready for transactions.')
                this.headId = greetings.hydraHeadId
                return { headId: this.headId!, status: 'Open' }
            }

            if (greetings.headStatus === 'Initializing') {
                console.log('Head is Initializing. Waiting for HeadIsOpen or returning Initializing...')
                if (greetings.hydraHeadId) this.headId = greetings.hydraHeadId

                // If initializing, we return immediately so UI can prompt for Commit
                return { headId: this.headId!, status: 'Initializing' }
            }
        }

        // 3. If Idle (or unknown), we send Init.
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.ws!.removeEventListener('message', listener)
                reject(new Error('Timeout waiting for Head status.'))
            }, 15000)

            const listener = (event: MessageEvent) => {
                try {
                    const msg = JSON.parse(event.data)

                    if (msg.tag === 'ReadyToInit') {
                        console.log('Received ReadyToInit. Sending Init...')
                        const payload = JSON.stringify({
                            tag: 'Init',
                            contestationPeriod: 60
                        })
                        this.ws!.send(payload)
                    }
                    else if (msg.tag === 'HeadIsInitialized') {
                        console.log('Head Initialized. Returning status...')
                        this.headId = msg.headId
                        clearTimeout(timeout)
                        this.ws!.removeEventListener('message', listener)
                        resolve({ headId: msg.headId, status: 'Initializing' })
                    }
                    else if (msg.tag === 'HeadIsOpen') {
                        clearTimeout(timeout)
                        this.headId = msg.headId
                        this.ws!.removeEventListener('message', listener)
                        resolve({ headId: msg.headId, status: 'Open' })
                    }
                    else if (msg.tag === 'CommandFailed') {
                        console.warn('Command failed:', msg)
                        if (msg.clientInput?.tag === 'Init') {
                            console.log('Init failed. Checking if already open...')
                            if (this.headId) {
                                clearTimeout(timeout)
                                this.ws!.removeEventListener('message', listener)
                                // Assume open if we have headId but Init failed
                                resolve({ headId: this.headId, status: 'Open' })
                            }
                        }
                    }
                } catch (e) {
                    console.error('Error parsing Hydra message:', e)
                }
            }
            this.ws!.addEventListener('message', listener)
        })
    }

    private async waitForHeadOpen(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.headId) resolve(this.headId)

            const listener = (event: MessageEvent) => {
                const msg = JSON.parse(event.data)
                if (msg.tag === 'HeadIsOpen') {
                    this.headId = msg.headId
                    this.ws!.removeEventListener('message', listener)
                    resolve(msg.headId)
                }
            }
            this.ws!.addEventListener('message', listener)

            setTimeout(() => {
                this.ws?.removeEventListener('message', listener)
                if (this.headId) resolve(this.headId)
                else reject(new Error('Timed out waiting for HeadIsOpen'))
            }, 5000)
        })
    }

    // Protocol Commit (Deposit) - Should be called when Head is Initializing
    async commit(utxo: any): Promise<void> {
        if (!this.ws) throw new Error('Not connected')

        console.log("Sending Commit (Deposit) to Hydra...");

        // Construct the UTXO map expected by Hydra
        // Lucid UTXO: { txHash, outputIndex, ... }
        // Hydra expects: { "txHash#index": utxo }
        const key = `${utxo.txHash}#${utxo.outputIndex}`;

        this.ws.send(JSON.stringify({
            tag: "Commit",
            utxo: { [key]: utxo }
        }));
    }

    // L2 Transaction (NewTx) - "Git Commit" - Should be called when Head is Open
    async sendL2Transaction(commit: HydraCommit, lucid: any): Promise<string> {
        if (!this.headId) {
            try {
                const { status } = await this.openHead()
                if (status !== 'Open') {
                    throw new Error('Head is not Open (it is Initializing). Please Deposit first.')
                }
            } catch (e) {
                throw new Error('Head not initialized and failed to auto-open')
            }
        }

        if (!lucid) {
            throw new Error('Lucid instance required for signing commits')
        }
        if (!lucid.wallet) {
            throw new Error('Wallet not selected. Please connect your wallet first.')
        }

        console.log('Building Hydra L2 transaction (NewTx)...')

        const address = await lucid.wallet.address()

        const metadata = {
            id: commit.id,
            msg: commit.message,
            cid: commit.sourceCID || "pending-ipfs",
            ver: commit.version
        }

        let txCbor;
        try {
            const tx = await lucid.newTx()
                .payToAddress(address, { lovelace: BigInt(1000000) })
                .attachMetadata(674, metadata)
                .complete()

            const signedTx = await tx.sign().complete()
            txCbor = signedTx.toString()
        } catch (e: any) {
            console.error('Failed to build/sign transaction:', e)
            if (e.message && e.message.includes('TransactionBuilderConfig')) {
                throw new Error('Failed to build transaction: Lucid configuration missing protocol parameters. Please check your network connection and API keys.')
            }
            throw e
        }

        console.log('Sending NewTx to Hydra:', txCbor.slice(0, 20) + '...')

        this.ws!.send(JSON.stringify({
            tag: 'NewTx',
            transaction: {
                cborHex: txCbor
            }
        }))

        return commit.id
    }

    async getCommits(packageId?: string): Promise<HydraCommit[]> {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            try {
                await this.connect()
            } catch (e) {
                console.warn('Could not connect to Hydra to fetch commits')
                return []
            }
        }

        this.ws!.send(JSON.stringify({ tag: 'GetUTxO' }))

        return new Promise((resolve) => {
            const listener = (event: MessageEvent) => {
                const msg = JSON.parse(event.data)
                if (msg.tag === 'SnapshotConfirmed') {
                    const commits = this.parseCommitsFromSnapshot(msg.snapshot)
                    this.ws!.removeEventListener('message', listener)
                    resolve(packageId
                        ? commits.filter(c => c.packageId === packageId)
                        : commits
                    )
                }
            }
            this.ws!.addEventListener('message', listener)

            setTimeout(() => {
                this.ws?.removeEventListener('message', listener)
                resolve([])
            }, 2000)
        })
    }

    async closeAndSettle(): Promise<string> {
        if (!this.headId) throw new Error('Head not initialized')

        this.ws!.send(JSON.stringify({ tag: 'Close' }))

        return new Promise((resolve) => {
            const listener = (event: MessageEvent) => {
                const msg = JSON.parse(event.data)
                if (msg.tag === 'HeadIsClosed') {
                    this.ws!.removeEventListener('message', listener)
                    resolve(msg.snapshotNumber)
                }
            }
            this.ws!.addEventListener('message', listener)
        })
    }

    private parseCommitsFromSnapshot(snapshot: any): HydraCommit[] {
        return Object.values(snapshot.utxo || {})
            .filter((utxo: any) => utxo.datum?.type === 'commit')
            .map((utxo: any) => utxo.datum.data)
    }
}

export const hydraClient = new HydraClient()
export type { HydraCommit }
