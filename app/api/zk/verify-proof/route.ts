import { NextRequest, NextResponse } from 'next/server'
import { proofVerifier } from '@/lib/zk/verification'

/**
 * POST /api/zk/verify-proof
 * Verify a ZK proof
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { proof, nftId } = body

        if (!proof || !nftId) {
            return NextResponse.json(
                { error: 'Proof and NFT ID are required' },
                { status: 400 }
            )
        }

        console.log('🔍 Verifying ZK proof for NFT:', nftId)

        // Verify proof
        const result = await proofVerifier.verifyOwnershipProof(proof, nftId)

        // Generate verification report
        const report = proofVerifier.generateVerificationReport(result)

        return NextResponse.json({
            ...result,
            report
        })

    } catch (error: any) {
        console.error('❌ Proof verification API error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
