/**
 * Mock IPFS for Demo/Testing
 * Generates realistic CIDs for hackathon presentation
 * Switch to real IPFS when network allows
 */

/**
 * Generate a realistic IPFS CID (v1)
 */
function generateRealisticCID(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz234567'
    let cid = 'bafybei'
    for (let i = 0; i < 52; i++) {
        cid += chars[Math.floor(Math.random() * chars.length)]
    }
    return cid
}

/**
 * Upload file to IPFS (MOCK - for demo purposes)
 * @param file - File object to upload
 * @returns IPFS CID with ipfs:// prefix
 */
export async function uploadToIPFS(file: File): Promise<string> {
    console.log('📦 [MOCK IPFS] Uploading file:', file.name, `(${(file.size / 1024).toFixed(2)} KB)`)

    // Simulate realistic upload delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const cid = generateRealisticCID()
    console.log('✅ [MOCK IPFS] File uploaded successfully')
    console.log('   CID:', cid)
    console.log('   Gateway:', `https://ipfs.io/ipfs/${cid}`)

    return `ipfs://${cid}`
}

/**
 * Upload JSON to IPFS (MOCK - for demo purposes)
 * @param json - JSON object to upload
 * @returns IPFS CID with ipfs:// prefix
 */
export async function uploadJSONToIPFS(json: object): Promise<string> {
    console.log('📦 [MOCK IPFS] Uploading JSON metadata')
    console.log('   Size:', JSON.stringify(json).length, 'bytes')

    // Simulate realistic upload delay
    await new Promise(resolve => setTimeout(resolve, 1200))

    const cid = generateRealisticCID()
    console.log('✅ [MOCK IPFS] JSON uploaded successfully')
    console.log('   CID:', cid)

    return `ipfs://${cid}`
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
    return `https://ipfs.io/ipfs/${cid}`
}

/**
 * Test IPFS connection (always returns true for mock)
 * @returns true
 */
export async function testIPFSConnection(): Promise<boolean> {
    console.log('✅ [MOCK IPFS] Connection test passed (mock mode)')
    return true
}

// Log that we're using mock IPFS
console.log('⚠️  Using MOCK IPFS for demo purposes')
console.log('   Real IPFS blocked by network/firewall')
console.log('   CIDs are realistic but files not actually uploaded')
console.log('   Cardano transactions will still work!')
