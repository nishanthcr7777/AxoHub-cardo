import { NextRequest, NextResponse } from 'next/server'
import { Lucid, Blockfrost } from 'lucid-cardano'

/**
 * GET /api/zk/check-nft/[nftId]
 * Check if NFT exists on Cardano blockchain
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { nftId: string } }
) {
    try {
        const nftId = decodeURIComponent(params.nftId)

        console.log('🔍 Checking NFT existence:', nftId)

        // Parse NFT ID
        const [policyId, assetName] = nftId.split('.')

        if (!policyId || !assetName) {
            return NextResponse.json(
                { exists: false, error: 'Invalid NFT ID format' },
                { status: 400 }
            )
        }

        // Initialize Blockfrost config
        const blockfrostUrl = process.env.NEXT_PUBLIC_BLOCKFROST_URL || 'https://cardano-preprod.blockfrost.io/api/v0'
        const blockfrostKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY

        if (!blockfrostKey) {
            return NextResponse.json(
                { exists: false, error: 'Server configuration error: Missing Blockfrost API key' },
                { status: 500 }
            )
        }

        // Check if NFT exists using Blockfrost API directly
        try {
            const response = await fetch(`${blockfrostUrl}/assets/${policyId}${assetName}`, {
                headers: {
                    'project_id': blockfrostKey
                }
            })

            if (response.status === 404) {
                return NextResponse.json({
                    exists: false,
                    error: 'NFT not found on chain'
                })
            }

            if (!response.ok) {
                throw new Error(`Blockfrost API error: ${response.statusText}`)
            }

            const assetDetails = await response.json()

            return NextResponse.json({
                exists: true,
                asset: assetDetails
            })
        } catch (error) {
            return NextResponse.json({
                exists: false,
                error: 'NFT not found on chain'
            })
        }

    } catch (error: any) {
        console.error('❌ NFT check error:', error)
        return NextResponse.json(
            { exists: false, error: error.message },
            { status: 500 }
        )
    }
}
