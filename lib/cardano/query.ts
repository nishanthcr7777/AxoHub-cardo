/**
 * Cardano Query Utilities
 * Phase 1: Query published items from Cardano blockchain
 * Queries transactions from wallet address and parses metadata
 */

import { RegistryDatum } from "./types"

/**
 * Get all published items from Cardano blockchain
 * Queries transactions from the connected wallet and parses metadata
 */
export async function getAllPublished(walletAddress?: string): Promise<RegistryDatum[]> {
    try {
        const blockfrostApiKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY
        const network = process.env.NEXT_PUBLIC_CARDANO_NETWORK?.toLowerCase() || "preprod"

        if (!blockfrostApiKey) {
            console.warn("Blockfrost API key not configured, returning empty array")
            return []
        }

        // If no wallet address provided, try to get from localStorage
        if (!walletAddress) {
            if (typeof window !== 'undefined') {
                const stored = localStorage.getItem('cardano_published_items')
                if (stored) {
                    return JSON.parse(stored).sort((a: RegistryDatum, b: RegistryDatum) => b.timestamp - a.timestamp)
                }
            }
            return []
        }

        // Query transactions from wallet address
        const baseUrl = `https://cardano-${network}.blockfrost.io/api/v0`

        // Get all transactions from this address
        const txResponse = await fetch(`${baseUrl}/addresses/${walletAddress}/transactions?order=desc&count=100`, {
            headers: {
                'project_id': blockfrostApiKey
            }
        })

        if (!txResponse.ok) {
            console.error("Failed to fetch transactions:", txResponse.status)
            return []
        }

        const transactions = await txResponse.json()
        const items: RegistryDatum[] = []

        // Parse each transaction for registry metadata (label 721)
        for (const tx of transactions) {
            try {
                const metadataResponse = await fetch(`${baseUrl}/txs/${tx.tx_hash}/metadata`, {
                    headers: {
                        'project_id': blockfrostApiKey
                    }
                })

                if (!metadataResponse.ok) continue

                const metadata = await metadataResponse.json()

                // Look for our registry metadata (label 721)
                const registryMetadata = metadata.find((m: any) => m.label === '721')

                if (registryMetadata && registryMetadata.json_metadata?.registry) {
                    const reg = registryMetadata.json_metadata.registry

                    // Reconstruct chunked strings
                    const unchunk = (value: string | string[]) => {
                        return Array.isArray(value) ? value.join('') : value
                    }

                    const item: RegistryDatum = {
                        type: reg.type as "contract" | "package",
                        name: unchunk(reg.name),
                        version: reg.version,
                        sourceCID: unchunk(reg.sourceCID),
                        metadataCID: unchunk(reg.metadataCID),
                        publisher: unchunk(reg.publisher),
                        timestamp: reg.timestamp
                    }

                    items.push(item)
                }
            } catch (error) {
                console.error("Failed to parse transaction metadata:", error)
                continue
            }
        }

        // Sort by timestamp descending
        return items.sort((a, b) => b.timestamp - a.timestamp)

    } catch (error) {
        console.error("Failed to query Cardano:", error)
        return []
    }
}

/**
 * Get all published versions for a specific contract or package
 */
export async function getVersions(
    name: string,
    type: "contract" | "package",
    walletAddress?: string
): Promise<RegistryDatum[]> {
    const all = await getAllPublished(walletAddress)
    return all.filter(item => item.name === name && item.type === type)
}

/**
 * Save published item to localStorage (backup)
 * This is called after successful Cardano publish
 */
export function savePublishedItem(item: RegistryDatum): void {
    if (typeof window === 'undefined') return

    const stored = localStorage.getItem('cardano_published_items')
    const items: RegistryDatum[] = stored ? JSON.parse(stored) : []

    // Add new item
    items.push(item)

    // Save back
    localStorage.setItem('cardano_published_items', JSON.stringify(items))

    console.log('✅ Saved published item to local backup:', item.name, item.version)
}
