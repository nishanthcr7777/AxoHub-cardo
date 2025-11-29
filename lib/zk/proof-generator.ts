/**
 * ZK Proof Generator - High-level API for generating ownership proofs
 */

import { midnightClient, ZKProof, ZKProofInputs } from './midnight-client'
import { Lucid, Blockfrost } from 'lucid-cardano'

const DEMO_MODE = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE !== 'false';

// Demo NFT data for testing
const DEMO_NFTS: Record<string, any> = {
    'demo.test1': {
        asset: 'demo.test1',
        policy_id: 'demo',
        asset_name: 'test1',
        onchain_metadata: {
            name: 'Demo NFT 1',
            encryptedCID: 'QmDemo1EncryptedCIDHash123456789',
            description: 'Demo NFT for testing ZK proofs'
        }
    },
    'demo.test2': {
        asset: 'demo.test2',
        policy_id: 'demo',
        asset_name: 'test2',
        onchain_metadata: {
            name: 'Demo NFT 2',
            encryptedCID: 'QmDemo2EncryptedCIDHash987654321',
            description: 'Another demo NFT'
        }
    }
};

export interface ProofGenerationResult {
    success: boolean
    proof?: ZKProof
    error?: string
    metadata: {
        nftExists: boolean
        metadataValid: boolean
        packageHashMatches: boolean
        timestamp: number
        mode?: 'demo' | 'real'
    }
}

export class ProofGenerator {
    private lucid: Lucid | null = null

    /**
     * Initialize Cardano connection
     */
    async initialize() {
        if (this.lucid || DEMO_MODE) return

        try {
            this.lucid = await Lucid.new(
                new Blockfrost(
                    process.env.NEXT_PUBLIC_BLOCKFROST_URL || 'https://cardano-preprod.blockfrost.io/api/v0',
                    process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY!
                ),
                'Preprod'
            )
        } catch (error) {
            console.warn('Failed to initialize Lucid, falling back to demo mode:', error);
        }
    }

    /**
     * Generate ZK proof of NFT ownership
     * This is the main entry point for proof generation
     */
    async generateOwnershipProof(nftId: string): Promise<ProofGenerationResult> {
        try {
            console.log('🚀 Starting ZK proof generation for NFT:', nftId);
            console.log(`   Mode: ${DEMO_MODE ? 'DEMO' : 'REAL'}`);

            // Step 1: Fetch NFT metadata from Cardano (or use demo data)
            console.log('📡 Fetching NFT metadata...');
            const metadata = await this.fetchNFTMetadata(nftId);

            if (!metadata) {
                return {
                    success: false,
                    error: DEMO_MODE
                        ? `NFT not found. Try using demo NFT IDs: ${Object.keys(DEMO_NFTS).join(', ')}`
                        : 'NFT not found on chain',
                    metadata: {
                        nftExists: false,
                        metadataValid: false,
                        packageHashMatches: false,
                        timestamp: Date.now(),
                        mode: DEMO_MODE ? 'demo' : 'real'
                    }
                }
            }

            // Step 2: Extract encrypted CID hash from metadata
            console.log('🔐 Extracting encrypted CID hash...');
            const encryptedCidHash = await this.extractEncryptedCidHash(metadata);

            // Step 3: Generate ZK proof
            console.log('🌑 Generating Midnight ZK proof...');
            const inputs: ZKProofInputs = {
                nftId,
                encryptedCidHash
            };

            const proof = await midnightClient.generateOwnershipProof(inputs);

            // Step 4: Verify proof
            console.log('🔍 Verifying proof...');
            const isValid = await midnightClient.verifyProof(proof.proof, proof.publicSignals);

            if (!isValid) {
                return {
                    success: false,
                    error: 'Generated proof is invalid',
                    metadata: {
                        nftExists: true,
                        metadataValid: true,
                        packageHashMatches: false,
                        timestamp: Date.now(),
                        mode: DEMO_MODE ? 'demo' : 'real'
                    }
                }
            }

            // Success!
            console.log('✅ ZK proof generated and verified successfully');
            return {
                success: true,
                proof,
                metadata: {
                    nftExists: true,
                    metadataValid: true,
                    packageHashMatches: true,
                    timestamp: Date.now(),
                    mode: DEMO_MODE ? 'demo' : 'real'
                }
            }

        } catch (error: any) {
            console.error('❌ Proof generation failed:', error);
            return {
                success: false,
                error: error.message || 'Unknown error occurred',
                metadata: {
                    nftExists: false,
                    metadataValid: false,
                    packageHashMatches: false,
                    timestamp: Date.now(),
                    mode: DEMO_MODE ? 'demo' : 'real'
                }
            }
        }
    }

    /**
     * Fetch NFT metadata from Cardano blockchain or demo data
     */
    private async fetchNFTMetadata(nftId: string): Promise<any> {
        // Check demo NFTs first
        if (DEMO_MODE && DEMO_NFTS[nftId]) {
            console.log('📦 Using demo NFT data');
            return DEMO_NFTS[nftId];
        }

        // Try to fetch from real blockchain
        try {
            // Parse NFT ID (format: policyId.assetName)
            const [policyId, assetName] = nftId.split('.');

            if (!policyId || !assetName) {
                throw new Error('Invalid NFT ID format. Expected: policyId.assetName');
            }

            // Use Blockfrost API directly
            const blockfrostUrl = process.env.NEXT_PUBLIC_BLOCKFROST_URL || 'https://cardano-preprod.blockfrost.io/api/v0';
            const blockfrostKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY;

            if (!blockfrostKey) {
                console.warn('Blockfrost API key not found, using demo mode');
                return DEMO_NFTS[nftId] || null;
            }

            const assetId = policyId + assetName;
            const response = await fetch(`${blockfrostUrl}/assets/${assetId}`, {
                headers: {
                    'project_id': blockfrostKey
                }
            });

            if (!response.ok) {
                throw new Error(`Blockfrost API error: ${response.statusText}`);
            }

            const assetDetails = await response.json();
            return assetDetails;
        } catch (error) {
            console.error('Failed to fetch NFT metadata from blockchain:', error);

            // Fall back to demo data if available
            if (DEMO_NFTS[nftId]) {
                console.log('📦 Falling back to demo NFT data');
                return DEMO_NFTS[nftId];
            }

            return null;
        }
    }

    /**
     * Extract and hash the encrypted CID from NFT metadata
     */
    private async extractEncryptedCidHash(metadata: any): Promise<string> {
        try {
            // Extract encrypted CID from metadata
            // Assuming metadata structure: { encryptedCID: "..." }
            const encryptedCID = metadata.onchain_metadata?.encryptedCID ||
                metadata.metadata?.encryptedCID ||
                metadata.encryptedCID;

            if (!encryptedCID) {
                // For demo mode, generate a mock encrypted CID
                if (DEMO_MODE) {
                    const mockCID = `QmMock${Date.now()}`;
                    console.log('🔐 Using mock encrypted CID');
                    return await midnightClient.hashData(mockCID);
                }
                throw new Error('Encrypted CID not found in NFT metadata');
            }

            // Hash the encrypted CID (this is what goes into the ZK circuit)
            const hash = await midnightClient.hashData(encryptedCID);

            console.log('🔐 Encrypted CID hash:', hash.substring(0, 16) + '...');
            return hash;
        } catch (error: any) {
            console.error('Failed to extract encrypted CID hash:', error);
            throw error;
        }
    }

    /**
     * Format proof for display in UI
     */
    formatProofForDisplay(proof: ZKProof): {
        proofPreview: string
        publicSignalsPreview: string
        fullProof: string
    } {
        return {
            proofPreview: JSON.stringify(proof.proof).substring(0, 100) + '...',
            publicSignalsPreview: proof.publicSignals.join(', '),
            fullProof: JSON.stringify(proof, null, 2)
        }
    }

    /**
     * Export proof as downloadable file
     */
    exportProofAsFile(proof: ZKProof, nftId: string): Blob {
        const exportData = midnightClient.exportProof(proof, { nftId });
        return new Blob([exportData], { type: 'application/json' });
    }
}

// Singleton instance
export const proofGenerator = new ProofGenerator();
