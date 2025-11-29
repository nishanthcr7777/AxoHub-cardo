/**
 * SnarkJS ZK Proof Client
 * Simple, production-ready zero-knowledge proofs
 */

const snarkjs = require('snarkjs');
const fs = require('fs');
const path = require('path');

export type SnarkProof = {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
    curve: string;
};

export type ZKProof = {
    proof: SnarkProof;
    publicSignals: string[];
    metadata?: {
        nftId: string;
        timestamp: number;
        mode: 'real';
    };
};

export type ZKProofInputs = {
    nftId: string;
    encryptedCidHash: string;
};

export class SnarkJSClient {
    private initialized: boolean = false;
    private wasmPath: string;
    private zkeyPath: string;
    private vkeyPath: string;

    constructor() {
        const circuitsDir = path.join(process.cwd(), 'public', 'circuits');
        this.wasmPath = path.join(circuitsDir, 'ownership.wasm');
        this.zkeyPath = path.join(circuitsDir, 'ownership_final.zkey');
        this.vkeyPath = path.join(circuitsDir, 'verification_key.json');

        console.log('🔐 SnarkJS Client initialized');
        console.log('   WASM:', this.wasmPath);
        console.log('   ZKey:', this.zkeyPath);
    }

    /**
     * Initialize the client (check if circuit files exist)
     */
    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            console.log('🔧 Initializing SnarkJS client...');

            // Check if circuit files exist
            const wasmExists = fs.existsSync(this.wasmPath);
            const zkeyExists = fs.existsSync(this.zkeyPath);

            if (!wasmExists || !zkeyExists) {
                console.warn('⚠️  Circuit files not found. Run: npm run circuit:compile');
                console.warn('   WASM exists:', wasmExists);
                console.warn('   ZKey exists:', zkeyExists);
            } else {
                console.log('✅ Circuit files found');
            }

            this.initialized = true;
            console.log('✅ SnarkJS client initialized');
        } catch (error) {
            console.error('❌ Failed to initialize SnarkJS client:', error);
            throw error;
        }
    }

    /**
     * Generate a ZK proof of ownership
     */
    async generateOwnershipProof(inputs: ZKProofInputs): Promise<ZKProof> {
        await this.initialize();

        console.log('🌑 Generating SnarkJS ZK proof...');
        console.log(`   - NFT ID: ${inputs.nftId}`);
        console.log(`   - CID Hash: ${inputs.encryptedCidHash.substring(0, 16)}...`);

        try {
            // Convert inputs to BigInt for circuit
            const circuitInputs = {
                nftId: this.stringToBigInt(inputs.nftId),
                encryptedCid: this.stringToBigInt(inputs.encryptedCidHash)
            };

            console.log('📊 Circuit inputs prepared');
            console.log('   nftId (BigInt):', circuitInputs.nftId.toString());
            console.log('   encryptedCid (BigInt):', circuitInputs.encryptedCid.toString());

            // Generate proof using Groth16
            console.log('🔐 Generating Groth16 proof...');
            const { proof, publicSignals } = await snarkjs.groth16.fullProve(
                circuitInputs,
                this.wasmPath,
                this.zkeyPath
            );

            console.log('✅ Proof generated successfully');
            console.log('   Public signals:', publicSignals);

            return {
                proof,
                publicSignals,
                metadata: {
                    nftId: inputs.nftId,
                    timestamp: Date.now(),
                    mode: 'real'
                }
            };
        } catch (error: any) {
            console.error('❌ Proof generation failed:', error);
            throw new Error(`Failed to generate proof: ${error.message}`);
        }
    }

    /**
     * Verify a ZK proof
     */
    async verifyProof(proof: SnarkProof, publicSignals: string[]): Promise<boolean> {
        try {
            console.log('🔍 Verifying proof...');

            // Load verification key
            const vKey = JSON.parse(fs.readFileSync(this.vkeyPath, 'utf8'));

            // Verify using Groth16
            const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);

            console.log(`✅ Proof verification: ${isValid ? 'VALID' : 'INVALID'}`);
            return isValid;
        } catch (error: any) {
            console.error('❌ Verification failed:', error);
            return false;
        }
    }

    /**
     * Convert string to BigInt for circuit input
     */
    private stringToBigInt(str: string): bigint {
        // Convert string to hex, then to BigInt
        const hex = Buffer.from(str).toString('hex');
        return BigInt('0x' + hex);
    }

    /**
     * Hash data using SHA-256 (for compatibility)
     */
    async hashData(data: string): Promise<string> {
        if (typeof crypto !== 'undefined' && crypto.subtle) {
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(data);
            const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
        // Fallback for environments without crypto.subtle
        return `hash_${data.length}_${Date.now()}`;
    }

    /**
     * Export proof as JSON
     */
    exportProof(zkProof: ZKProof): string {
        return JSON.stringify(zkProof, null, 2);
    }

    /**
     * Check if running in demo mode (always false for SnarkJS)
     */
    isDemoMode(): boolean {
        return false;
    }
}

export const snarkjsClient = new SnarkJSClient();
