/**
 * Cardano Query Utilities
 * Phase 1: Query published versions from registry
 */

import { RegistryDatum } from "./types"

/**
 * Get all published versions for a contract or package
 * @param name - Contract or package name
 * @param type - Type filter
 * @returns Array of registry datums sorted by timestamp
 */
export async function getVersions(
    name: string,
    type: "contract" | "package"
): Promise<RegistryDatum[]> {
    // Dynamically import Lucid
    const { Lucid, Blockfrost, Data } = await import("lucid-cardano")

    const blockfrostApiKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY
    const network = process.env.NEXT_PUBLIC_CARDANO_NETWORK as "Preprod" | "Mainnet"
    const scriptAddress = process.env.NEXT_PUBLIC_REGISTRY_SCRIPT_ADDRESS

    if (!blockfrostApiKey || !scriptAddress) {
        throw new Error("Cardano configuration missing")
    }

    // Initialize Lucid
    const lucid = await Lucid.new(
        new Blockfrost(
            `https://cardano-${network.toLowerCase()}.blockfrost.io/api/v0`,
            blockfrostApiKey
        ),
        network
    )

    // Query UTxOs at script address
    const utxos = await lucid.utxosAt(scriptAddress)

    // Parse datums and filter
    const versions: RegistryDatum[] = []

    for (const utxo of utxos) {
        if (!utxo.datum) continue

        try {
            // Parse inline datum - cast to any to handle Lucid's complex Data types
            const datum = Data.from(utxo.datum) as any

            // Convert from Plutus data to our type
            const registryDatum: RegistryDatum = {
                type: Buffer.from(datum.type, "hex").toString() as "contract" | "package",
                name: Buffer.from(datum.name, "hex").toString(),
                version: Buffer.from(datum.version, "hex").toString(),
                sourceCID: Buffer.from(datum.sourceCID, "hex").toString(),
                metadataCID: Buffer.from(datum.metadataCID, "hex").toString(),
                publisher: Buffer.from(datum.publisher, "hex").toString(),
                timestamp: Number(datum.timestamp),
            }

            // Filter by name and type
            if (registryDatum.name === name && registryDatum.type === type) {
                versions.push(registryDatum)
            }
        } catch (error) {
            console.error("Failed to parse datum:", error)
            continue
        }
    }

    // Sort by timestamp descending (newest first)
    return versions.sort((a, b) => b.timestamp - a.timestamp)
}

/**
 * Get all published items (contracts and packages)
 * @returns Array of all registry datums
 */
export async function getAllPublished(): Promise<RegistryDatum[]> {
    const { Lucid, Blockfrost, Data } = await import("lucid-cardano")

    const blockfrostApiKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY
    const network = process.env.NEXT_PUBLIC_CARDANO_NETWORK as "Preprod" | "Mainnet"
    const scriptAddress = process.env.NEXT_PUBLIC_REGISTRY_SCRIPT_ADDRESS

    if (!blockfrostApiKey || !scriptAddress) {
        throw new Error("Cardano configuration missing")
    }

    const lucid = await Lucid.new(
        new Blockfrost(
            `https://cardano-${network.toLowerCase()}.blockfrost.io/api/v0`,
            blockfrostApiKey
        ),
        network
    )

    const utxos = await lucid.utxosAt(scriptAddress)
    const items: RegistryDatum[] = []

    for (const utxo of utxos) {
        if (!utxo.datum) continue

        try {
            // Cast to any to handle Lucid's complex Data types
            const datum = Data.from(utxo.datum) as any

            const registryDatum: RegistryDatum = {
                type: Buffer.from(datum.type, "hex").toString() as "contract" | "package",
                name: Buffer.from(datum.name, "hex").toString(),
                version: Buffer.from(datum.version, "hex").toString(),
                sourceCID: Buffer.from(datum.sourceCID, "hex").toString(),
                metadataCID: Buffer.from(datum.metadataCID, "hex").toString(),
                publisher: Buffer.from(datum.publisher, "hex").toString(),
                timestamp: Number(datum.timestamp),
            }

            items.push(registryDatum)
        } catch (error) {
            console.error("Failed to parse datum:", error)
            continue
        }
    }

    return items.sort((a, b) => b.timestamp - a.timestamp)
}
