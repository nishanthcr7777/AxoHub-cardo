import { NextRequest, NextResponse } from 'next/server'
import { Lucid, Blockfrost } from 'lucid-cardano'
import crypto from 'crypto'

/**
 * GET /api/zk/metadata/[nftId]
 * Fetch NFT metadata and return encrypted CID hash
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { nftId: string } }
) {
    try {
        const nftId = decodeURIComponent(params.nftId)

        console.log('📡 Fetching NFT metadata:', nftId)

        // Parse NFT ID
        const [policyId, assetName] = nftId.split('.')

        if (!policyId || !assetName) {
            return NextResponse.json(
                { error: 'Invalid NFT ID format' },
                { status: 400 }
            )
        }

        // Initialize Blockfrost config
        const blockfrostUrl = process.env.NEXT_PUBLIC_BLOCKFROST_URL || 'https://cardano-preprod.blockfrost.io/api/v0'
        const blockfrostKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY

        if (!blockfrostKey) {
            return NextResponse.json(
                { error: 'Server configuration error: Missing Blockfrost API key' },
                { status: 500 }
            )
        }

        // Fetch NFT metadata using Blockfrost API directly
        const response = await fetch(`${blockfrostUrl}/assets/${policyId}${assetName}`, {
            headers: {
                'project_id': blockfrostKey
            }
        })

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json(
                    { error: 'NFT not found on chain' },
                    { status: 404 }
                )
            }
            throw new Error(`Blockfrost API error: ${response.statusText}`)
        }

        const assetDetails = await response.json()

        // Extract encrypted CID from metadata
        const metadata = assetDetails.onchain_metadata || assetDetails.metadata || {}
        const encryptedCID = metadata.encryptedCID || metadata.encrypted_cid

        if (!encryptedCID) {
            return NextResponse.json(
                { error: 'No encrypted CID found in NFT metadata' },
                { status: 404 }
            )
        }

        // Hash the encrypted CID (don't reveal the actual CID!)
        const encryptedCidHash = crypto
            .createHash('sha256')
            .update(encryptedCID)
            .digest('hex')

        console.log('🔐 Encrypted CID hash:', encryptedCidHash.substring(0, 16) + '...')

        return NextResponse.json({
            nftId,
            encryptedCidHash,
            // DO NOT include the actual encryptedCID!
            metadata: {
                name: metadata.name,
                description: metadata.description,
                // Only include non-sensitive metadata
            }
        })

    } catch (error: any) {
        console.error('❌ Metadata fetch error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch metadata' },
            { status: 500 }
        )
    }
}
