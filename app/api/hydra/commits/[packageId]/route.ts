import { NextRequest, NextResponse } from 'next/server'
import { hydraClient } from '@/lib/hydra/client'

export async function GET(
    req: NextRequest,
    { params }: { params: { packageId: string } }
) {
    try {
        const packageId = params.packageId

        // Connect to Hydra
        try {
            await hydraClient.connect()
        } catch (e) {
            console.warn('Hydra connection warning:', e)
        }

        // Fetch commits from Hydra state
        const commits = await hydraClient.getCommits(packageId)

        // Sort by timestamp descending
        const sortedCommits = commits.sort((a, b) => b.timestamp - a.timestamp)

        return NextResponse.json({
            success: true,
            commits: sortedCommits
        })

    } catch (error) {
        console.error('Get commits error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch commits' },
            { status: 500 }
        )
    }
}
