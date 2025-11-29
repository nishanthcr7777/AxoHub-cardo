import { NextRequest, NextResponse } from 'next/server'
import { proofGenerator } from '@/lib/zk/proof-generator'

/**
 * POST /api/zk/generate-proof
 * Generate a ZK proof of NFT ownership
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { nftId } = body

        if (!nftId) {
            return NextResponse.json(
                { error: 'NFT ID is required' },
                { status: 400 }
            )
        }

        console.log('🌑 Generating ZK proof for NFT:', nftId)

        // Generate proof
        const result = await proofGenerator.generateOwnershipProof(nftId)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to generate proof' },
                { status: 400 }
            )
        }

        // Return proof and metadata
        return NextResponse.json({
            success: true,
            proof: result.proof,
            metadata: result.metadata,
            nftId
        })

    } catch (error: any) {
        console.error('❌ Proof generation API error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
