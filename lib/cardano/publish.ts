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
    const scriptAddress = process.env.NEXT_PUBLIC_REGISTRY_SCRIPT_ADDRESS

    if (!blockfrostApiKey) {
        throw new Error("Blockfrost API key not configured")
    }

    if (!scriptAddress) {
        throw new Error("Registry script address not configured")
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

    // Define datum schema for inline datum
    const RegistryDatumSchema = Data.Object({
        type: Data.Bytes(),
        name: Data.Bytes(),
        version: Data.Bytes(),
        sourceCID: Data.Bytes(),
        metadataCID: Data.Bytes(),
        publisher: Data.Bytes(),
        timestamp: Data.Integer(),
    })

    // Convert datum to Plutus data
    const datumData = Data.to(
        {
            type: Buffer.from(datum.type).toString("hex"),
            name: Buffer.from(datum.name).toString("hex"),
            version: Buffer.from(datum.version).toString("hex"),
            sourceCID: Buffer.from(datum.sourceCID).toString("hex"),
            metadataCID: Buffer.from(datum.metadataCID).toString("hex"),
            publisher: Buffer.from(datum.publisher).toString("hex"),
            timestamp: BigInt(datum.timestamp),
        } as any,
        RegistryDatumSchema
    )

    // Build transaction
    // Send 2 ADA to script address with inline datum
    const tx = await lucid
        .newTx()
        .payToContract(
            scriptAddress,
            { inline: datumData },
            { lovelace: BigInt(2_000_000) } // 2 ADA
        )
        .complete()

    // Note: Transaction signing will be done in the UI with wallet
    // This function returns the unsigned transaction
    // The UI will sign and submit it

    return {
        txHash: "", // Will be filled after signing
        sourceCID: params.sourceCID,
        metadataCID: params.metadataCID,
        timestamp: datum.timestamp,
    }
}

/**
 * Build unsigned transaction for publishing
 * Returns transaction object that can be signed by wallet
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
    const { Data } = await import("lucid-cardano")

    const scriptAddress = process.env.NEXT_PUBLIC_REGISTRY_SCRIPT_ADDRESS

    if (!scriptAddress) {
        throw new Error("Registry script address not configured")
    }

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

    // Define datum schema
    const RegistryDatumSchema = Data.Object({
        type: Data.Bytes(),
        name: Data.Bytes(),
        version: Data.Bytes(),
        sourceCID: Data.Bytes(),
        metadataCID: Data.Bytes(),
        publisher: Data.Bytes(),
        timestamp: Data.Integer(),
    })

    // Convert to Plutus data
    const datumData = Data.to(
        {
            type: Buffer.from(datum.type).toString("hex"),
            name: Buffer.from(datum.name).toString("hex"),
            version: Buffer.from(datum.version).toString("hex"),
            sourceCID: Buffer.from(datum.sourceCID).toString("hex"),
            metadataCID: Buffer.from(datum.metadataCID).toString("hex"),
            publisher: Buffer.from(datum.publisher).toString("hex"),
            timestamp: BigInt(datum.timestamp),
        } as any,
        RegistryDatumSchema
    )

    // Build transaction
    const tx = await params.lucid
        .newTx()
        .payToContract(
            scriptAddress,
            { inline: datumData },
            { lovelace: BigInt(2_000_000) }
        )
        .complete()

    return { tx, datum }
}
