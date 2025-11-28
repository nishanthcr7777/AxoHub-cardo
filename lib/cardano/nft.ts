/**
 * Access Control for Private Sources
 * 
 * Stores access metadata on-chain using transaction metadata
 * Chunks long strings to comply with Cardano's 64-character limit
 */

import { Lucid } from "lucid-cardano"

export interface AccessNFTMetadata {
    name: string
    version: string
    encryptedCID: string
    encryptionKey: string
    sourceHash: string
    compiler: string
    license: string
    timestamp: number
    owner: string
}

/**
 * Store access metadata on-chain
 * @param params - Metadata parameters
 * @returns Transaction hash (used as access key)
 */
export async function mintAccessNFT(params: {
    metadata: AccessNFTMetadata
    lucid: Lucid
    walletAddress: string
}): Promise<string> {
    const { metadata, lucid } = params

    try {
        // Helper to split long strings into 64-char chunks
        const chunkString = (str: string, size: number = 64): string[] => {
            const chunks: string[] = []
            for (let i = 0; i < str.length; i += size) {
                chunks.push(str.slice(i, i + size))
            }
            return chunks
        }

        // Split long values into chunks (Cardano has 64-char limit per string)
        const encKeyChunks = chunkString(metadata.encryptionKey)
        const cidChunks = chunkString(metadata.encryptedCID)
        const ownerChunks = chunkString(metadata.owner)

        // Create metadata with chunked values
        const txMetadata: any = {
            name: metadata.name.slice(0, 64),
            version: metadata.version.slice(0, 64),
            compiler: metadata.compiler.slice(0, 64),
            license: metadata.license.slice(0, 64),
            sourceHash: metadata.sourceHash.slice(0, 64),
            timestamp: metadata.timestamp.toString(),
            type: "PrivateSourceAccess"
        }

        // Add chunked encryption key
        encKeyChunks.forEach((chunk, i) => {
            txMetadata[`key${i}`] = chunk
        })

        // Add chunked CID
        cidChunks.forEach((chunk, i) => {
            txMetadata[`cid${i}`] = chunk
        })

        // Add chunked owner
        ownerChunks.forEach((chunk, i) => {
            txMetadata[`owner${i}`] = chunk
        })

        // Create transaction with metadata
        const tx = await lucid
            .newTx()
            .attachMetadata(674, txMetadata)
            .complete()

        const signed = await tx.sign().complete()
        const txHash = await signed.submit()

        console.log('✅ Access metadata stored on-chain!')
        console.log('🔗 Transaction:', txHash)
        console.log('🔑 Access Key (save this):', txHash)

        return txHash

    } catch (error) {
        console.error('Metadata storage error:', error)
        throw new Error(`Failed to store access metadata: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

/**
 * Query access metadata from Cardano
 * @param txHash - Transaction hash (access key)
 * @param lucid - Lucid instance
 * @returns Access metadata or null if not found
 */
export async function queryAccessNFT(
    txHash: string,
    lucid: Lucid
): Promise<AccessNFTMetadata | null> {
    try {
        console.log('[Access Query] Querying transaction:', txHash)

        const blockfrostApiKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY
        const network = process.env.NEXT_PUBLIC_CARDANO_NETWORK?.toLowerCase() || "preprod"

        if (!blockfrostApiKey) {
            throw new Error("Blockfrost API key not configured")
        }

        // Query transaction metadata
        const response = await fetch(
            `https://cardano-${network}.blockfrost.io/api/v0/txs/${txHash}/metadata`,
            {
                headers: {
                    'project_id': blockfrostApiKey
                }
            }
        )

        if (!response.ok) {
            console.error('Transaction not found:', txHash)
            return null
        }

        const metadata = await response.json()

        // Find label 674 metadata
        const accessMetadata = metadata.find((m: any) => m.label === '674')

        if (!accessMetadata || !accessMetadata.json_metadata) {
            console.error('No access metadata found in transaction')
            return null
        }

        const data = accessMetadata.json_metadata

        // Reassemble chunked values
        const reassembleChunks = (obj: any, prefix: string): string => {
            let result = ''
            let i = 0
            while (obj[`${prefix}${i}`]) {
                result += obj[`${prefix}${i}`]
                i++
            }
            return result
        }

        const encryptionKey = reassembleChunks(data, 'key')
        const encryptedCID = reassembleChunks(data, 'cid')
        const owner = reassembleChunks(data, 'owner')

        return {
            name: data.name || '',
            version: data.version || '',
            encryptedCID,
            encryptionKey,
            sourceHash: data.sourceHash || '',
            compiler: data.compiler || '',
            license: data.license || '',
            timestamp: parseInt(data.timestamp) || 0,
            owner
        }
    } catch (error) {
        console.error('Error querying access metadata:', error)
        return null
    }
}
