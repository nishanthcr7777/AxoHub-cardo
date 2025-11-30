import { Lucid, Blockfrost, Data, Constr } from "lucid-cardano"
import { HydraCommit } from "@/lib/cardano/types"

export async function batchPublishCommits(
    commits: HydraCommit[],
    walletApi: any // Wallet provider API
): Promise<string> {
    try {
        // Initialize Lucid
        const lucid = await Lucid.new(
            new Blockfrost(
                process.env.NEXT_PUBLIC_BLOCKFROST_URL || "https://cardano-preprod.blockfrost.io/api/v0",
                process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY || ""
            ),
            "Preprod"
        )

        // Select wallet
        lucid.selectWallet(walletApi)

        // Prepare metadata
        // We use label 721 for NFT-like metadata or a custom label for our registry
        // For this MVP, we'll use a custom label 674 (arbitrary for "Open Source Registry")
        const metadata = {
            [674]: {
                p: "axohub-vcs",
                v: 1,
                commits: commits.map(c => ({
                    id: c.id,
                    v: c.version,
                    msg: c.message,
                    src: c.sourceCID,
                    meta: c.metadataCID,
                    ts: c.timestamp,
                    auth: c.author
                }))
            }
        }

        // Build transaction
        // We attach metadata and send a small amount to the script address (or self for now)
        // to anchor the metadata on-chain.
        const tx = await lucid.newTx()
            .attachMetadata(674, metadata[674])
            .payToAddress(await lucid.wallet.address(), { lovelace: 1000000n }) // Send to self to record metadata
            .complete()

        // Sign transaction
        const signedTx = await tx.sign().complete()

        // Submit transaction
        const txHash = await signedTx.submit()

        return txHash
    } catch (error) {
        console.error("Batch publish error:", error)
        throw new Error("Failed to publish commits to L1")
    }
}
