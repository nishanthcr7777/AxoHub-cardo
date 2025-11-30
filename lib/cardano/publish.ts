/**
 * Cardano Publishing Utilities
 * Phase 1: Publish to Cardano testnet using Lucid
 */

import { RegistryDatum, PublishResult } from "./types"

/**
 * Publish a contract or package to Cardano registry
 * @param params - Registry datum parameters
 * @returns Transaction hash and metadata
 */
export async function publishToCardano(params: {
    type: "contract" | "package"
    name: string
    version: string
    sourceCID: string
    metadataCID: string
    walletAddress: string
}): Promise<PublishResult> {
    // Dynamically import Lucid to avoid SSR issues
    const { Lucid, Blockfrost, Data } = await import("lucid-cardano")

    const blockfrostApiKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY
    const network = process.env.NEXT_PUBLIC_CARDANO_NETWORK as "Preprod" | "Mainnet"

    if (!blockfrostApiKey) {
        throw new Error("Blockfrost API key not configured")
    }

    // Initialize Lucid
    const lucid = await Lucid.new(
        new Blockfrost(
            `https://cardano-${network.toLowerCase()}.blockfrost.io/api/v0`,
            blockfrostApiKey
        ),
        network
    )

    // Create registry datum
    const datum: RegistryDatum = {
        type: params.type,
        name: params.name,
        version: params.version,
        sourceCID: params.sourceCID,
        metadataCID: params.metadataCID,
        publisher: params.walletAddress,
        timestamp: Date.now(),
    }

    // Note: Transaction signing will be done in the UI with wallet
    // This function returns placeholder data
    // The UI will build and sign the actual transaction

    return {
        txHash: "", // Will be filled after signing
        sourceCID: params.sourceCID,
        metadataCID: params.metadataCID,
        timestamp: datum.timestamp,
    }
}

/**
 * Build unsigned transaction for publishing
 * Phase 1: Simple transaction with metadata (no inline datum for now)
 * Phase 2: Will use payToContract with Aiken validator and inline datum
 */
export async function buildPublishTransaction(params: {
    type: "contract" | "package"
    name: string
    version: string
    sourceCID: string
    metadataCID: string
    walletAddress: string
    lucid: any // Lucid instance from wallet context
}) {
    // Create registry datum
    const datum: RegistryDatum = {
        type: params.type,
        name: params.name,
        version: params.version,
        sourceCID: params.sourceCID,
        metadataCID: params.metadataCID,
        publisher: params.walletAddress,
        timestamp: Date.now(),
    }

    // Helper to chunk strings longer than 64 chars (Cardano metadata limit)
    const chunkString = (str: string, size: number = 64): string | string[] => {
        if (str.length <= size) return str
        const chunks: string[] = []
        for (let i = 0; i < str.length; i += size) {
            chunks.push(str.slice(i, i + size))
        }
        return chunks
    }

    // Build transaction with metadata
    // Phase 1: Simple transaction with registry data in metadata
    // Chunk long strings to respect 64-char limit
    const tx = await params.lucid
        .newTx()
        .payToAddress(
            params.walletAddress,
            { lovelace: BigInt(2_000_000) }
        )
        .attachMetadata(721, {
            registry: {
                type: datum.type,
                name: chunkString(datum.name),
                version: datum.version,
                sourceCID: chunkString(datum.sourceCID),
                metadataCID: chunkString(datum.metadataCID),
                publisher: chunkString(datum.publisher),
                timestamp: datum.timestamp,
            }
        })
        .complete()

    return { tx, datum }
}
