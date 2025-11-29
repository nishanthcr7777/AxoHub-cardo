/**
 * Cardano Registry Types with Aiken Validator Support
 * Phase 2: Added redeemer types and validator integration
 */

// Registry datum (matches Aiken validator)
export interface RegistryDatum {
    type: "contract" | "package"
    name: string
    version: string
    sourceCID: string
    metadataCID: string
    publisher: string  // Cardano address
    timestamp: number  // Unix timestamp in milliseconds
}

// Registry actions (redeemer for Aiken validator)
export type RegistryAction =
    | { type: "Publish" }
    | { type: "Update"; oldVersion: string }
    | { type: "Deprecate"; reason: string }

// NFT minting action
export type MintAction =
    | { type: "MintNFT"; name: string; version: string }
    | { type: "BurnNFT" }

// Publish result
export interface PublishResult {
    txHash: string
    sourceCID: string
    metadataCID: string
    timestamp: number
    nftTokenName?: string  // Phase 2: NFT token name
}

// Contract metadata
export interface ContractMetadata {
    name: string
    version: string
    description: string
    compiler: string
    author?: string
    license?: string
    repository?: string
}

// Package metadata
export interface PackageMetadata {
    name: string
    version: string
    description: string
    author?: string
    license?: string
    dependencies?: Record<string, string>
    repository?: string
}

// Validator configuration
export interface ValidatorConfig {
    scriptAddress: string
    policyId: string
    referenceScriptUtxo?: string  // Optional: for reference script
}

// ============================================
// Midnight ZK Proof Types
// ============================================

// ZK Ownership Proof
export interface ZKOwnershipProof {
    proof: any  // snarkjs proof object
    publicSignals: string[]
    timestamp: number
    nftId: string
    isValid: boolean
}

// ZK Verification Result
export interface ZKVerificationResult {
    verified: boolean
    nftExists: boolean
    metadataValid: boolean
    packageHashMatches: boolean
    proof: ZKOwnershipProof
    timestamp: number
    details: {
        proofValid: boolean
        publicSignalsValid: boolean
        nftOnChain: boolean
        cidHashMatches: boolean
    }
}

// ZK Proof Generation Result
export interface ZKProofGenerationResult {
    success: boolean
    proof?: ZKOwnershipProof
    error?: string
    metadata: {
        nftExists: boolean
        metadataValid: boolean
        packageHashMatches: boolean
        timestamp: number
    }
}
