/**
 * Mock Hydra Client - Simulates Hydra Head Lifecycle
 * 
 * This client mimics the behavior of a real Hydra node for demonstration purposes.
 * It simulates:
 * 1. Connection delay
 * 2. Head Initialization (Idle -> Initializing)
 * 3. Commit/Deposit delay
 * 4. Head Opening (Initializing -> Open)
 * 5. L2 Transactions (Instant confirmation)
 * 6. Head Closing and Settlement
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
    private headId: string | null = null
    private status: 'Idle' | 'Initializing' | 'Open' | 'Closed' = 'Idle'
    private commits: HydraCommit[] = []

    constructor(private url: string = process.env.NEXT_PUBLIC_HYDRA_WS_URL || 'ws://localhost:5001') { }

    async connect(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 800))
        console.log('Connected to Hydra node')
    }

    async openHead(): Promise<{ headId: string, status: 'Initializing' | 'Open' }> {
        await this.connect()

        if (this.status === 'Open') {
            return { headId: this.headId!, status: 'Open' }
        }

        if (this.status === 'Initializing') {
            return { headId: this.headId!, status: 'Initializing' }
        }

        // Simulate Init command
        console.log('Sending Init command...')
        await new Promise(resolve => setTimeout(resolve, 1000))

        this.headId = "head_" + Math.random().toString(36).substr(2, 9)
        this.status = 'Initializing'
        console.log('Head Initialized:', this.headId)

        return { headId: this.headId, status: 'Initializing' }
    }

    // Protocol Commit (Deposit) - Should be called when Head is Initializing
    async commit(utxo: any): Promise<void> {
        if (this.status !== 'Initializing') {
            throw new Error('Head must be Initializing to commit (deposit)')
        }

        console.log("Sending Commit (Deposit) to Hydra...");
        await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate L1 transaction time

        // Auto-transition to Open after deposit
        this.status = 'Open'
        console.log('Head is now Open!')
    }

    // L2 Transaction (NewTx) - "Git Commit" - Should be called when Head is Open
    async sendL2Transaction(commit: HydraCommit, lucid: any): Promise<string> {
        if (this.status !== 'Open') {
            // Auto-recover for demo flow if needed, but strict mode is better
            throw new Error('Head is not Open. Please Deposit first.')
        }

        if (!lucid) throw new Error('Lucid instance required')

        console.log('Building Hydra L2 transaction (NewTx)...')
        // Simulate signing delay
        await new Promise(resolve => setTimeout(resolve, 500))

        console.log('Sending NewTx to Hydra...')
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300))

        this.commits.push(commit)
        return commit.id
    }

    async getCommits(packageId?: string): Promise<HydraCommit[]> {
        // Simulate fetching from snapshot
        await new Promise(resolve => setTimeout(resolve, 400))
        return this.commits
    }

    async closeAndSettle(): Promise<string> {
        if (this.status !== 'Open') throw new Error('Head not Open')

        console.log('Sending Close command...')
        await new Promise(resolve => setTimeout(resolve, 1500))

        this.status = 'Closed'
        console.log('Head Closed. Fanout complete.')

        return "snapshot_" + Math.random().toString(36).substr(2, 9)
    }
}

export const hydraClient = new HydraClient()
export type { HydraCommit }
