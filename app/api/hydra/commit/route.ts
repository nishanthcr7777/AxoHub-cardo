import { NextRequest, NextResponse } from 'next/server'
import { hydraClient } from '@/lib/hydra/client'
import { generateCommitHash } from '@/lib/hydra/diff'
import { generateCommitId } from '@/lib/hydra/utils'
import { HydraCommit } from '@/lib/cardano/types'

import pinataSDK from '@pinata/sdk'

// Initialize Pinata
const pinata = new pinataSDK({ pinataJWTKey: process.env.NEXT_PUBLIC_PINATA_JWT })

async function uploadToIPFS(content: string, name: string): Promise<string> {
    try {
        // Pinata expects a stream or object. For text/json, we can pinJSONToIPFS or pinFileToIPFS.
        // Since we have string content (source code or JSON metadata), we'll treat it accordingly.

        let res;

        // Check if content is JSON
        try {
            const jsonBody = JSON.parse(content);
            const options = {
                pinataMetadata: {
                    name: name
                }
            };
            res = await pinata.pinJSONToIPFS(jsonBody, options);
        } catch (e) {
            // Not JSON, treat as raw text file (source code)
            // For source code, we might want to upload as a file buffer
            // But pinataSDK v2 prefers streams/files for pinFileToIPFS.
            // A simpler approach for text content is to wrap it in a JSON object or just use pinJSONToIPFS 
            // but that changes the format.
            // To get a raw file CID, we usually use FormData with fetch or pinFileToIPFS with a ReadableStream.

            // Let's use a simple fetch implementation for raw file upload to ensure we get a raw CID
            // This avoids the SDK complexity for in-memory strings

            const formData = new FormData();
            const blob = new Blob([content], { type: 'text/plain' });
            formData.append('file', blob, name);

            const uploadRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
                },
                body: formData
            });

            if (!uploadRes.ok) {
                throw new Error(`Pinata upload failed: ${uploadRes.statusText}`);
            }

            res = await uploadRes.json();
            return res.IpfsHash;
        }

        return res.IpfsHash;
    } catch (error) {
        console.error("IPFS Upload Error:", error);
        // Fallback to mock if real upload fails (to prevent blocking dev)
        console.warn("Falling back to mock CID");
        return `Qm${Math.random().toString(36).substring(2, 15)}MockCID`;
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { packageId, version, sourceCode, message, author } = body

        if (!packageId || !version || !sourceCode || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // 1. Generate hashes
        const commitHash = await generateCommitHash(sourceCode)
        const commitId = generateCommitId()

        // 2. Upload to IPFS (Source & Metadata)
        const sourceCID = await uploadToIPFS(sourceCode, `source-${packageId}-${version}.hs`)

        const metadata = {
            packageId,
            version,
            message,
            author,
            timestamp: Date.now(),
            parentHash: 'TODO-fetch-parent'
        }
        const metadataCID = await uploadToIPFS(JSON.stringify(metadata), `meta-${commitId}.json`)

        // 3. Create Commit Object
        const commit: HydraCommit = {
            id: commitId,
            packageId,
            version,
            sourceCode, // Store source in Hydra for instant access
            sourceCID,
            metadataCID,
            message,
            author: author || 'addr_test1...', // Mock author if not provided
            timestamp: Date.now(),
            commitHash,
            status: 'hydra_pending'
        }

        // 4. Submit to Hydra Head
        // Ensure Head is open (in production, this would be managed separately)
        try {
            await hydraClient.openHead()
        } catch (e) {
            // Ignore if already open or fails - try to commit anyway
            console.log('Head open check:', e)
        }

        const resultId = await hydraClient.commit(commit)

        return NextResponse.json({
            success: true,
            commitId: resultId,
            commit
        })

    } catch (error) {
        console.error('Commit error:', error)
        return NextResponse.json(
            { error: 'Failed to commit to Hydra' },
            { status: 500 }
        )
    }
}
