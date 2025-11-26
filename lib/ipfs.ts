/**
 * IPFS Integration using Pinata
 * Phase 1: Core file and JSON upload
 */

import axios from "axios"

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY
const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs/"

/**
 * Upload a file to IPFS via Pinata
 * @param file - File object to upload
 * @returns IPFS CID with ipfs:// prefix
 */
export async function uploadToIPFS(file: File): Promise<string> {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
        throw new Error("Pinata API keys not configured. Add them to .env.local")
    }

    const formData = new FormData()
    formData.append("file", file)

    const metadata = JSON.stringify({
        name: file.name,
    })
    formData.append("pinataMetadata", metadata)

    const options = JSON.stringify({
        cidVersion: 1,
    })
    formData.append("pinataOptions", options)

    try {
        const response = await axios.post(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            formData,
            {
                maxBodyLength: Infinity,
                headers: {
                    "Content-Type": `multipart/form-data`,
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_SECRET_KEY,
                },
            }
        )

        const cid = response.data.IpfsHash
        return `ipfs://${cid}`
    } catch (error) {
        console.error("IPFS upload error:", error)
        throw new Error("Failed to upload file to IPFS")
    }
}

/**
 * Upload JSON data to IPFS via Pinata
 * @param json - JSON object to upload
 * @returns IPFS CID with ipfs:// prefix
 */
export async function uploadJSONToIPFS(json: object): Promise<string> {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
        throw new Error("Pinata API keys not configured. Add them to .env.local")
    }

    try {
        const response = await axios.post(
            "https://api.pinata.cloud/pinning/pinJSONToIPFS",
            json,
            {
                headers: {
                    "Content-Type": "application/json",
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_SECRET_KEY,
                },
            }
        )

        const cid = response.data.IpfsHash
        return `ipfs://${cid}`
    } catch (error) {
        console.error("IPFS JSON upload error:", error)
        throw new Error("Failed to upload JSON to IPFS")
    }
}

/**
 * Convert IPFS URI to HTTP gateway URL
 * @param ipfsUri - IPFS URI (ipfs://...)
 * @returns HTTP gateway URL
 */
export function ipfsToHttp(ipfsUri: string): string {
    if (!ipfsUri.startsWith("ipfs://")) {
        return ipfsUri
    }
    const cid = ipfsUri.replace("ipfs://", "")
    return `${PINATA_GATEWAY}${cid}`
}

/**
 * Test IPFS connection
 * @returns true if Pinata is configured correctly
 */
export async function testIPFSConnection(): Promise<boolean> {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
        return false
    }

    try {
        const response = await axios.get(
            "https://api.pinata.cloud/data/testAuthentication",
            {
                headers: {
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_SECRET_KEY,
                },
            }
        )
        return response.status === 200
    } catch (error) {
        console.error("IPFS connection test failed:", error)
        return false
    }
}
