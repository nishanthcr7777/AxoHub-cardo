/**
 * Cardano Registry Types for Phase 1
 * Stable schema used across all phases
 */

export interface RegistryDatum {
    type: "contract" | "package"
    name: string
    version: string
    sourceCID: string      // IPFS CID for source code
    metadataCID: string    // IPFS CID for metadata JSON
    publisher: string      // Cardano address
    timestamp: number      // Unix timestamp
}

export interface ContractMetadata {
    name: string
    version: string
    description: string
    abi: any
    bytecode: string
    compiler: string
    license?: string
    author?: string
}

export interface PackageMetadata {
    name: string
    version: string
    description: string
    author?: string
    license?: string
    dependencies?: Record<string, string>
    repository?: string
}

export interface PublishResult {
    txHash: string
    sourceCID: string
    metadataCID: string
    timestamp: number
}
