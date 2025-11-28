/**
 * NFT-based Access Control for Private Sources
 * 
 * Mints NFTs that contain encryption keys for accessing private source code
 */

import { Lucid, Data } from "lucid-cardano"

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
 * Mint an Access NFT
 * @param params - NFT parameters
 * @returns NFT token ID (policy + asset name)
 */
export async function mintAccessNFT(params: {
    metadata: AccessNFTMetadata
    lucid: Lucid
    walletAddress: string
}): Promise<string> {
    const { metadata, lucid, walletAddress } = params

    // Create unique asset name from metadata
    const assetName = `PrivateSource_${metadata.name}_${Date.now()}`
    const assetNameHex = Buffer.from(assetName).toString('hex')

    // Create minting policy (simple time-locked policy)
    const { paymentCredential } = lucid.utils.getAddressDetails(walletAddress)

    const mintingPolicy = lucid.utils.nativeScriptFromJson({
        type: "all",
        scripts: [
            {
                type: "sig",
                keyHash: paymentCredential?.hash || ""
            }
        ]
    })

    const policyId = lucid.utils.mintingPolicyToId(mintingPolicy)
    const unit = policyId + assetNameHex

    // Create NFT metadata (CIP-25)
    const nftMetadata = {
        [policyId]: {
            [assetName]: {
                name: `🔐 ${metadata.name} v${metadata.version}`,
                image: "ipfs://QmPrivateSourceLockIcon", // Placeholder
                description: `Access key for private source: ${metadata.name}`,
                // Embed encryption key and metadata
                encryptedCID: metadata.encryptedCID,
                encryptionKey: metadata.encryptionKey,
                sourceHash: metadata.sourceHash,
                compiler: metadata.compiler,
                license: metadata.license,
                timestamp: metadata.timestamp,
                owner: metadata.owner
            }
        }
    }

    // Build and submit transaction
    const tx = await lucid
        .newTx()
        .mintAssets({
            [unit]: BigInt(1)
        }, Data.void())
        .attachMintingPolicy(mintingPolicy)
        .attachMetadata(721, nftMetadata)
        .complete()

    const signed = await tx.sign().complete()
    const txHash = await signed.submit()

    console.log('✅ Access NFT minted!')
    console.log('📦 Token ID:', unit)
    console.log('🔗 Transaction:', txHash)

    return unit // This is the NFT token ID (passkey)
}

/**
 * Query NFT metadata from Cardano
 * @param tokenId - NFT token ID (policy + asset name)
 * @param lucid - Lucid instance
 * @returns NFT metadata or null if not found
 */
export async function queryAccessNFT(
    tokenId: string,
    lucid: Lucid
): Promise<AccessNFTMetadata | null> {
    try {
        // Extract policy ID and asset name
        const policyId = tokenId.slice(0, 56)
        const assetNameHex = tokenId.slice(56)
        const assetName = Buffer.from(assetNameHex, 'hex').toString()

        // Query Blockfrost for NFT metadata
        const blockfrostApiKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY
        const network = process.env.NEXT_PUBLIC_CARDANO_NETWORK?.toLowerCase() || "preprod"

        if (!blockfrostApiKey) {
            throw new Error("Blockfrost API key not configured")
        }

        const response = await fetch(
            `https://cardano-${network}.blockfrost.io/api/v0/assets/${tokenId}`,
            {
                headers: {
                    'project_id': blockfrostApiKey
                }
            }
        )

        if (!response.ok) {
            console.error('NFT not found:', tokenId)
            return null
        }

        const asset = await response.json()

        // Get on-chain metadata
        const metadataResponse = await fetch(
            `https://cardano-${network}.blockfrost.io/api/v0/assets/${tokenId}/metadata`,
            {
                headers: {
                    'project_id': blockfrostApiKey
                }
            }
        )

        if (!metadataResponse.ok) {
            return null
        }

        const metadata = await metadataResponse.json()

        // Extract our custom metadata
        const nftData = metadata.onchain_metadata?.[policyId]?.[assetName]

        if (!nftData) {
            return null
        }

        return {
            name: nftData.name || '',
            version: '',
            encryptedCID: nftData.encryptedCID || '',
            encryptionKey: nftData.encryptionKey || '',
            sourceHash: nftData.sourceHash || '',
            compiler: nftData.compiler || '',
            license: nftData.license || '',
            timestamp: nftData.timestamp || 0,
            owner: nftData.owner || ''
        }
    } catch (error) {
        console.error('Error querying NFT:', error)
        return null
    }
}

/**
 * Burn/revoke access NFT
 * @param tokenId - NFT token ID to burn
 * @param lucid - Lucid instance
 * @returns Transaction hash
 */
export async function burnAccessNFT(
    tokenId: string,
    lucid: Lucid,
    walletAddress: string
): Promise<string> {
    const { paymentCredential } = lucid.utils.getAddressDetails(walletAddress)

    const mintingPolicy = lucid.utils.nativeScriptFromJson({
        type: "all",
        scripts: [
            {
                type: "sig",
                keyHash: paymentCredential?.hash || ""
            }
        ]
    })

    // Burn the NFT
    const tx = await lucid
        .newTx()
        .mintAssets({
            [tokenId]: BigInt(-1)
        }, Data.void())
        .attachMintingPolicy(mintingPolicy)
        .complete()

    const signed = await tx.sign().complete()
    const txHash = await signed.submit()

    console.log('🔥 Access NFT burned (access revoked)')
    console.log('🔗 Transaction:', txHash)

    return txHash
}
