import { NextRequest, NextResponse } from 'next/server'
import { hydraClient } from '@/lib/hydra/client'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { packageId, walletApi } = body

        if (!packageId) {
            return NextResponse.json(
                { error: 'Missing packageId' },
                { status: 400 }
            )
        }

        // 1. Close Hydra Head and Settle
        // This triggers the fanout/settlement process on the Hydra node
        // In a real scenario, this might take some time (contestation period)
        // For the MVP, we assume immediate settlement or we trigger it and return

        let snapshot
        try {
            snapshot = await hydraClient.closeAndSettle()
        } catch (e) {
            console.warn("Failed to close head (maybe already closed or mock mode):", e)
            // If failed, we might still want to proceed if we have the commits locally/in-db
            // For now, we'll proceed assuming the client will handle the actual L1 tx
            // But strictly speaking, the backend should probably coordinate this.

            // Since the actual L1 transaction signing needs the USER'S wallet,
            // the backend can't sign it unless it's a custodial wallet.
            // So this endpoint might just be for "Closing the Head" 
            // and the frontend handles the L1 submission using `batchPublishCommits`.

            // Let's adjust: This endpoint closes the head and returns the final snapshot/commits
            // so the frontend can sign the L1 tx.
        }

        // Fetch all pending commits to return to frontend for signing
        const commits = await hydraClient.getCommits(packageId)
        const pendingCommits = commits.filter(c => c.status === 'hydra_pending')

        return NextResponse.json({
            success: true,
            commits: pendingCommits,
            snapshotNumber: snapshot
        })

    } catch (error) {
        console.error('Push error:', error)
        return NextResponse.json(
            { error: 'Failed to initiate push' },
            { status: 500 }
        )
    }
}
