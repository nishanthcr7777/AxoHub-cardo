/**
 * Pinata IPFS Integration
 * 
 * TO USE:
 * 1. Get JWT token from https://app.pinata.cloud/developers/api-keys
 * 2. Add to .env.local: NEXT_PUBLIC_PINATA_JWT=your_jwt_token
 * 3. Restart dev server
 * 
 * GATEWAY OPTIONS:
 * - Set NEXT_PUBLIC_PINATA_GATEWAY in .env.local to use custom gateway
 * - Default: Pinata's gateway
 * - Alternatives: https://ipfs.io/ipfs/, https://cloudflare-ipfs.com/ipfs/
 */

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT
const PINATA_API = "https://api.pinata.cloud/pinning"
// Configurable gateway - can be changed in .env.local
const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs/"

/**
 * Upload file to IPFS via Pinata
 * @param file - File object to upload
 * @returns IPFS CID with ipfs:// prefix
 */
export async function uploadToIPFS(file: File): Promise<string> {
    if (!PINATA_JWT) {
        throw new Error("Pinata JWT token not configured. Add NEXT_PUBLIC_PINATA_JWT to .env.local")
    }

    console.log('[Pinata] Uploading file:', file.name, `(${(file.size / 1024).toFixed(2)} KB)`)

    const formData = new FormData()
    formData.append('file', file)

    const metadata = JSON.stringify({
        name: file.name,
    })
    formData.append('pinataMetadata', metadata)

    const options = JSON.stringify({
        cidVersion: 1,
    })
    formData.append('pinataOptions', options)

    const response = await fetch(`${PINATA_API}/pinFileToIPFS`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${PINATA_JWT}`,
        },
        body: formData,
    })

    if (!response.ok) {
        const error = await response.text()
        console.error('Pinata upload error:', error)
        throw new Error(`Pinata upload failed: ${response.status} - ${error}`)
    }

    const data = await response.json()
    const cid = data.IpfsHash
    console.log('[Pinata] ✅ File uploaded successfully')
    console.log('📦 CID:', cid)
    console.log('🔗 Gateway URL:', `${IPFS_GATEWAY}${cid}`)
    console.log('💡 View in Pinata:', `https://app.pinata.cloud/pinmanager`)

    return `ipfs://${cid}`
}

/**
 * Upload JSON to IPFS via Pinata
 * @param json - JSON object to upload
 * @returns IPFS CID with ipfs:// prefix
 */
export async function uploadJSONToIPFS(json: object): Promise<string> {
    if (!PINATA_JWT) {
        throw new Error("Pinata JWT token not configured. Add NEXT_PUBLIC_PINATA_JWT to .env.local")
    }

    console.log('[Pinata] Uploading JSON metadata')
    console.log('Size:', JSON.stringify(json).length, 'bytes')

    const body = {
        pinataContent: json,
        pinataMetadata: {
            name: 'metadata.json',
        },
        pinataOptions: {
            cidVersion: 1,
        },
    }

    const response = await fetch(`${PINATA_API}/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PINATA_JWT}`,
        },
        body: JSON.stringify(body),
    })

    if (!response.ok) {
        const error = await response.text()
        console.error('Pinata upload error:', error)
        throw new Error(`Pinata upload failed: ${response.status} - ${error}`)
    }

    const data = await response.json()
    const cid = data.IpfsHash
    console.log('[Pinata] ✅ JSON uploaded successfully')
    console.log('📦 CID:', cid)

    return `ipfs://${cid}`
}

/**
 * Convert IPFS URI to HTTP gateway URL
 * @param ipfsUri - IPFS URI (ipfs://...)
 * @returns HTTP gateway URL
 */
export function ipfsToHttp(ipfsUri: string): string {
    const cid = ipfsUri.startsWith("ipfs://")
        ? ipfsUri.replace("ipfs://", "")
        : ipfsUri
    return `${IPFS_GATEWAY}${cid}`
}

/**
 * Get just the CID from IPFS URI
 * @param ipfsUri - IPFS URI (ipfs://...)
 * @returns Just the CID
 */
export function getCID(ipfsUri: string): string {
    return ipfsUri.replace("ipfs://", "")
}

/**
 * Test IPFS connection
 * @returns true if connection successful, false otherwise
 */
export async function testIPFSConnection(): Promise<boolean> {
    if (!PINATA_JWT) {
        console.error('⚠️ [Pinata] JWT token not configured')
        return false
    }

    try {
        const response = await fetch(`${PINATA_API}/data/testAuthentication`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${PINATA_JWT}`,
            },
        })

        if (response.ok) {
            console.log('✅ [Pinata] Connection test passed')
            return true
        } else {
            console.error('❌ [Pinata] Connection test failed:', response.status)
            return false
        }
    } catch (error) {
        console.error('❌ [Pinata] Connection test error:', error)
        return false
    }
}

// Log Pinata status
if (PINATA_JWT) {
    console.log('📌 Using Pinata IPFS')
    console.log('🌐 Gateway:', IPFS_GATEWAY)
    console.log('💡 Tip: Set NEXT_PUBLIC_IPFS_GATEWAY in .env.local to use a different gateway')
} else {
    console.warn('⚠️ Pinata JWT not configured')
    console.warn('   Add NEXT_PUBLIC_PINATA_JWT to .env.local')
}
