/**
 * SnarkJS ZK Proof Client
 * Simple, production-ready zero-knowledge proofs
 */

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
        // In browser, these are relative URLs to the public folder
        this.wasmPath = '/circuits/ownership.wasm';
        this.zkeyPath = '/circuits/ownership_final.zkey';
        this.vkeyPath = '/circuits/verification_key.json';

        console.log('🔐 SnarkJS Client initialized');
    }

    /**
     * Initialize the client
     */
    async initialize(): Promise<void> {
        if (this.initialized) return;
        console.log('🔧 Initializing SnarkJS client...');

        // Check if snarkjs is loaded
        if (typeof window !== 'undefined' && !(window as any).snarkjs) {
            console.warn('⚠️ snarkjs not found on window object. Waiting for script load...');
            // Simple retry logic could be added here
        }

        this.initialized = true;
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
            // Access global snarkjs
            const snarkjs = (window as any).snarkjs;

            if (!snarkjs) {
                throw new Error("SnarkJS library not loaded. Please refresh the page.");
            }

            // Construct absolute URLs
            const origin = window.location.origin;
            const wasmUrl = `${origin}${this.wasmPath}`;
            const zkeyUrl = `${origin}${this.zkeyPath}`;

            console.log(`🔍 Checking artifacts at:`);
            console.log(`   - WASM: ${wasmUrl}`);
            console.log(`   - ZKey: ${zkeyUrl}`);

            // Verify artifacts are accessible
            const checkArtifact = async (url: string, name: string) => {
                const res = await fetch(url, { method: 'HEAD' });
                if (!res.ok) {
                    throw new Error(`Failed to fetch ${name}: ${res.status} ${res.statusText}`);
                }
                const contentType = res.headers.get('content-type');
                console.log(`   ✅ ${name} found (${contentType})`);
                if (contentType && contentType.includes('text/html')) {
                    throw new Error(`${name} returned HTML (likely 404/error page) instead of binary.`);
                }
            };

            await checkArtifact(wasmUrl, 'WASM');
            await checkArtifact(zkeyUrl, 'ZKey');

            // Convert inputs to BigInt then string (decimal) for snarkjs
            const circuitInputs = {
                nftId: this.stringToBigInt(inputs.nftId).toString(),
                encryptedCid: this.stringToBigInt(inputs.encryptedCidHash).toString()
            };

            console.log('📊 Circuit inputs prepared:', circuitInputs);

            // Generate proof using Groth16
            console.log('🔐 Generating Groth16 proof...');

            // Add timeout race
            const proofPromise = snarkjs.groth16.fullProve(
                circuitInputs,
                wasmUrl,
                zkeyUrl
            );

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Proof generation timed out after 20s")), 20000)
            );

            const { proof, publicSignals } = await Promise.race([proofPromise, timeoutPromise]) as any;

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

            // Access global snarkjs
            const snarkjs = (window as any).snarkjs;

            if (!snarkjs) {
                throw new Error("SnarkJS library not loaded");
            }

            // Fetch verification key
            const vKeyResponse = await fetch(this.vkeyPath);
            const vKey = await vKeyResponse.json();

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
        // Browser-compatible string to hex conversion
        let hex = '';
        for (let i = 0; i < str.length; i++) {
            hex += str.charCodeAt(i).toString(16).padStart(2, '0');
        }
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
