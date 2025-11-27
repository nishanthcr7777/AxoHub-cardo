/**
 * REAL IPFS Integration using Lighthouse.storage
 * 
 * TO USE THIS FILE:
 * 1. Get Lighthouse API key from https://files.lighthouse.storage
 * 2. Add to .env.local: NEXT_PUBLIC_LIGHTHOUSE_API_KEY=your_key
 * 3. Rename this file from ipfs-real.ts to ipfs.ts
 * 4. Restart dev server
 */

const LIGHTHOUSE_API_KEY = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY
const IPFS_GATEWAY = "https://gateway.lighthouse.storage/ipfs/"
const LIGHTHOUSE_API = "https://node.lighthouse.storage/api/v0"

export async function uploadToIPFS(file: File): Promise<string> {
    if (!LIGHTHOUSE_API_KEY) {
        throw new Error("Lighthouse API key not configured")
    }

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${LIGHTHOUSE_API}/add`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${LIGHTHOUSE_API_KEY}`,
        },
        body: formData,
    })

    if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ File uploaded to IPFS:', data.Hash)
    return `ipfs://${data.Hash}`
}

export async function uploadJSONToIPFS(json: object): Promise<string> {
    if (!LIGHTHOUSE_API_KEY) {
        throw new Error("Lighthouse API key not configured")
    }

    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })
    const file = new File([blob], 'metadata.json')

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${LIGHTHOUSE_API}/add`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${LIGHTHOUSE_API_KEY}`,
        },
        body: formData,
    })

    if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ JSON uploaded to IPFS:', data.Hash)
    return `ipfs://${data.Hash}`
}

export function ipfsToHttp(ipfsUri: string): string {
    if (!ipfsUri.startsWith("ipfs://")) return ipfsUri
    const cid = ipfsUri.replace("ipfs://", "")
    return `${IPFS_GATEWAY}${cid}`
}

export async function testIPFSConnection(): Promise<boolean> {
    if (!LIGHTHOUSE_API_KEY) return false
    try {
        const testBlob = new Blob(['test'])
        const testFile = new File([testBlob], 'test.txt')
        const formData = new FormData()
        formData.append('file', testFile)
        const response = await fetch(`${LIGHTHOUSE_API}/add`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${LIGHTHOUSE_API_KEY}` },
            body: formData,
        })
        return response.ok
    } catch {
        return false
    }
}
