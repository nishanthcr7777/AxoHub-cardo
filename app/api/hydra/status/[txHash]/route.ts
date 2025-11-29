import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    req: NextRequest,
    { params }: { params: { txHash: string } }
) {
    try {
        const txHash = params.txHash
        const blockfrostUrl = process.env.NEXT_PUBLIC_BLOCKFROST_URL || "https://cardano-preprod.blockfrost.io/api/v0"
        const apiKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY

        if (!apiKey) {
            return NextResponse.json({ error: 'Blockfrost API key not configured' }, { status: 500 })
        }

        const res = await fetch(`${blockfrostUrl}/txs/${txHash}`, {
            headers: { 'project_id': apiKey }
        })

        if (res.status === 404) {
            return NextResponse.json({ confirmed: false, status: 'pending' })
        }

        if (res.ok) {
            const data = await res.json()
            // If we have a block_height, it's confirmed
            return NextResponse.json({
                confirmed: !!data.block_height,
                status: data.block_height ? 'confirmed' : 'mempool',
                block: data.block_height
            })
        }

        return NextResponse.json({ confirmed: false, status: 'unknown' })

    } catch (error) {
        console.error('Status check error:', error)
        return NextResponse.json(
            { error: 'Failed to check status' },
            { status: 500 }
        )
    }
}
