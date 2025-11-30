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

    constructor(private url: string = 'ws://localhost:5001') { }

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log('Connecting to Hydra node at', this.url)
            this.ws = new WebSocket(this.url)

            this.ws.onopen = () => {
                console.log('Connected to Hydra node')
                resolve()
            }

            this.ws.onerror = (err) => {
                console.error('Hydra connection failed:', err)
                reject(new Error('Failed to connect to Hydra node. Is Docker running?'))
            }
        })
    }

    async openHead(): Promise<string> {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            await this.connect()
        }

        // Send Init command to Hydra
        this.ws!.send(JSON.stringify({
            tag: 'Init',
            contestationPeriod: 60 // 60 seconds
        }))

        // Wait for HeadIsInitialized response
        return new Promise((resolve) => {
            const listener = (event: MessageEvent) => {
                const msg = JSON.parse(event.data)
                if (msg.tag === 'HeadIsInitialized') {
                    this.headId = msg.headId
                    this.ws!.removeEventListener('message', listener)
                    resolve(msg.headId)
                }
            }
            this.ws!.addEventListener('message', listener)
        })
    }

    async commit(commit: HydraCommit): Promise<string> {
        if (!this.headId) {
            // Auto-open head if not open (for dev convenience)
            try {
                await this.openHead()
            } catch (e) {
                throw new Error('Head not initialized and failed to auto-open')
            }
        }

        // Store commit in Hydra state
        this.ws!.send(JSON.stringify({
            tag: 'NewTx',
            transaction: {
                type: 'commit',
                data: commit
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
                return [] // Return empty if can't connect
            }
        }

        // Query Hydra snapshot
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

            // Timeout fallback
            setTimeout(() => {
                this.ws?.removeEventListener('message', listener)
                resolve([])
            }, 2000)
        })
    }

    async closeAndSettle(): Promise<string> {
        if (!this.headId) throw new Error('Head not initialized')

        // Close Hydra Head
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
        // Parse UTxO set to extract commits
        // Simplified: assume commits are stored as datum
        return Object.values(snapshot.utxo || {})
            .filter((utxo: any) => utxo.datum?.type === 'commit')
            .map((utxo: any) => utxo.datum.data)
    }
}

export const hydraClient = new HydraClient()
export type { HydraCommit }
