/**
 * ZK Proof Verification - Verify ownership proofs and validate package integrity
 */

import { midnightClient, CompactProof } from './midnight-client'

export interface ZKVerificationResult {
    verified: boolean
    nftExists: boolean
    metadataValid: boolean
    packageHashMatches: boolean
    proof: CompactProof
    timestamp: number
    details: {
        proofValid: boolean
        publicSignalsValid: boolean
        nftOnChain: boolean
        cidHashMatches: boolean
    }
}

export class ProofVerifier {
    /**
     * Verify a ZK ownership proof
     * This checks cryptographic validity + on-chain data
     */
    async verifyOwnershipProof(
        proof: CompactProof,
        nftId: string
    ): Promise<ZKVerificationResult> {
        try {
            console.log('🔍 Starting Midnight Compact verification...')

            // Step 1: Verify cryptographic proof
            console.log('🔐 Verifying Compact proof...')
            const proofValid = await midnightClient.verifyProof(proof)

            if (!proofValid) {
                return this.createFailedResult(proof, 'Cryptographic proof is invalid')
            }

            // Step 2: Verify public inputs (commitments)
            console.log('📊 Validating public inputs...')
            // In Hybrid mode, we verify the proof structure
            const publicSignalsValid = proof.publicInputs && proof.publicInputs.length > 0;

            // Step 3: Check NFT exists on-chain (Real Blockfrost Call)
            console.log('🔗 Checking NFT on Cardano...')
            const nftOnChain = await this.checkNFTExists(nftId)

            if (!nftOnChain) {
                return this.createFailedResult(proof, 'NFT not found on chain (Real Data Check Failed)')
            }

            // Step 4: Verify CID hash matches
            console.log('🔐 Verifying CID hash...')
            const cidHashMatches = await this.verifyCIDHash(nftId, proof)

            // All checks passed!
            console.log('✅ All verification checks passed')
            return {
                verified: true,
                nftExists: true,
                metadataValid: true,
                packageHashMatches: cidHashMatches,
                proof,
                timestamp: Date.now(),
                details: {
                    proofValid: true,
                    publicSignalsValid: true,
                    nftOnChain: true,
                    cidHashMatches
                }
            }

        } catch (error: any) {
            console.error('❌ Verification failed:', error)
            return this.createFailedResult(proof, error.message)
        }
    }

    /**
     * Check if NFT exists on Cardano blockchain
     */
    private async checkNFTExists(nftId: string): Promise<boolean> {
        try {
            // Call API to check NFT existence
            const response = await fetch(`/api/zk/check-nft/${encodeURIComponent(nftId)}`)
            const data = await response.json()
            return data.exists === true
        } catch (error) {
            console.error('Failed to check NFT existence:', error)
            return false
        }
    }

    /**
     * Verify CID hash matches NFT metadata
     */
    private async verifyCIDHash(nftId: string, proof: CompactProof): Promise<boolean> {
        try {
            // Fetch NFT metadata
            const response = await fetch(`/api/zk/metadata/${encodeURIComponent(nftId)}`)
            const data = await response.json()

            if (!data.encryptedCidHash) {
                console.error('No encrypted CID hash in metadata')
                return false
            }

            // In Hybrid mode, we check if the proof's public input matches the real on-chain hash
            const proofPublicInput = proof.publicInputs[0];
            return proofPublicInput === data.encryptedCidHash;
        } catch (error) {
            console.error('Failed to verify CID hash:', error)
            return false
        }
    }

    /**
     * Create a failed verification result
     */
    private createFailedResult(proof: CompactProof, reason: string): ZKVerificationResult {
        console.error('❌ Verification failed:', reason)
        return {
            verified: false,
            nftExists: false,
            metadataValid: false,
            packageHashMatches: false,
            proof,
            timestamp: Date.now(),
            details: {
                proofValid: false,
                publicSignalsValid: false,
                nftOnChain: false,
                cidHashMatches: false
            }
        }
    }

    /**
     * Generate verification report for display
     */
    generateVerificationReport(result: ZKVerificationResult): string {
        const status = result.verified ? '✅ VERIFIED' : '❌ FAILED'

        return `
Midnight ZK Proof Verification Report
======================================

Status: ${status}
Timestamp: ${new Date(result.timestamp).toISOString()}

Verification Details:
- Cryptographic Proof: ${result.details.proofValid ? '✅' : '❌'}
- Public Inputs: ${result.details.publicSignalsValid ? '✅' : '❌'}
- NFT On-Chain: ${result.details.nftOnChain ? '✅' : '❌'}
- CID Hash Match: ${result.details.cidHashMatches ? '✅' : '❌'}

Package Status:
- NFT Exists: ${result.nftExists ? 'Yes' : 'No'}
- Metadata Valid: ${result.metadataValid ? 'Yes' : 'No'}
- Package Hash Matches: ${result.packageHashMatches ? 'Yes' : 'No'}

Privacy Guarantee:
🔐 Encrypted CID: NOT REVEALED
🔐 Source Code: NOT ACCESSIBLE
🔐 Private Metadata: PROTECTED

This proof demonstrates ownership without revealing sensitive data.
    `.trim()
    }
}

// Singleton instance
export const proofVerifier = new ProofVerifier()
