"use client"

/**
 * ZK Proof Dialog - Generate and display Midnight ZK proofs
 */

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card } from "./ui/card"
import { Loader2, CheckCircle, XCircle, Download, Share2 } from "lucide-react"
import { toast } from "sonner"
import { ZKProofResult } from "@/components/zk-proof-result"
import { snarkjsClient, ZKProof } from "@/lib/zk/snarkjs-client"
import { queryAccessNFT } from "@/lib/cardano/nft"
import { useCardanoWallet } from "@/contexts/CardanoWalletContext"

interface ZKProofDialogProps {
    isOpen: boolean
    onClose: () => void
    initialNftId?: string
    onProofGenerated?: (proof: ZKProof) => void
    onGeneratingChange?: (isGenerating: boolean) => void
}

type ProofStage = 'input' | 'generating' | 'success' | 'error'

export function ZKProofDialog({
    isOpen,
    onClose,
    initialNftId = "",
    onProofGenerated,
    onGeneratingChange
}: ZKProofDialogProps) {
    const { lucid } = useCardanoWallet()
    const [accessKey, setAccessKey] = useState(initialNftId)
    const [stage, setStage] = useState<ProofStage>('input')
    const [progress, setProgress] = useState(0)
    const [progressMessage, setProgressMessage] = useState("")
    const [proofResult, setProofResult] = useState<ZKProof | null>(null)
    const [error, setError] = useState("")

    const handleGenerateProof = async () => {
        if (!accessKey.trim()) {
            toast.error("Please enter the NFT Access Key")
            return
        }

        setStage('generating')
        setProgress(0)
        setError("")
        onGeneratingChange?.(true)

        try {
            // Step 1: Fetch Metadata (Secret)
            setProgressMessage("Fetching encrypted secret from chain...")
            setProgress(10)

            let encryptedCid = ""

            // Handle Demo Case
            if (accessKey === "demo.test1") {
                await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay
                encryptedCid = "QmTest1234567890EncryptedCIDSecretKey"
            } else {
                if (!lucid) {
                    throw new Error("Please connect your wallet to fetch metadata")
                }
                const metadata = await queryAccessNFT(accessKey.trim(), lucid)
                if (!metadata) {
                    throw new Error("Invalid Access Key or Metadata not found")
                }
                encryptedCid = metadata.encryptedCID
            }

            if (!encryptedCid) {
                throw new Error("Could not retrieve encrypted secret")
            }

            // Step 2: Initialize SnarkJS
            setProgressMessage("Initializing SnarkJS...")
            setProgress(30)
            await new Promise(resolve => setTimeout(resolve, 500))

            // Step 3: Generate Proof
            setProgressMessage("Generating ZK proof (this may take a moment)...")
            setProgress(50)

            const result = await snarkjsClient.generateOwnershipProof({
                nftId: accessKey.trim(),
                encryptedCidHash: encryptedCid
            })

            // Step 4: Verify proof
            setProgressMessage("Verifying proof on-client...")
            setProgress(80)

            const isValid = await snarkjsClient.verifyProof(result.proof, result.publicSignals)

            if (!isValid) {
                throw new Error("Generated proof failed verification")
            }

            setProgress(100)
            setProgressMessage("Proof generated & verified successfully!")

            // Success!
            setProofResult(result)
            setStage('success')
            onProofGenerated?.(result)
            toast.success("ZK proof generated and verified!")

        } catch (err: any) {
            console.error("Proof generation failed:", err)
            setError(err.message || "Failed to generate proof")
            setStage('error')
            toast.error(err.message || "Failed to generate ZK proof")
        } finally {
            onGeneratingChange?.(false)
        }
    }

    const handleReset = () => {
        setStage('input')
        setProgress(0)
        setProgressMessage("")
        setProofResult(null)
        setError("")
        setAccessKey("")
    }

    const handleDownloadProof = () => {
        if (!proofResult) return

        const blob = new Blob([JSON.stringify(proofResult, null, 2)], {
            type: 'application/json'
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `zk-proof-${accessKey}.json`
        a.click()
        URL.revokeObjectURL(url)
        toast.success("Proof downloaded!")
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <span>🌑</span>
                        ZK Proof Verification
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Generate a Zero-Knowledge proof of ownership using your NFT Access Key.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Input Stage */}
                    {stage === 'input' && (
                        <>
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-slate-300">NFT Access Key (Transaction Hash)</Label>
                                    <Input
                                        value={accessKey}
                                        onChange={(e) => setAccessKey(e.target.value)}
                                        placeholder="Paste your NFT Access Key here..."
                                        className="bg-slate-800 border-slate-700 text-white mt-2 font-mono text-sm"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        The app will automatically fetch the encrypted secret from the chain using this key.
                                    </p>
                                </div>
                            </div>

                            <Card className="p-4 bg-purple-900/20 border-purple-500/30">
                                <h4 className="text-sm font-semibold text-purple-300 mb-2">
                                    🔐 Privacy Guarantee
                                </h4>
                                <ul className="text-xs text-slate-300 space-y-1">
                                    <li>✅ Automatically fetches encrypted secret from chain</li>
                                    <li>✅ Verifies ownership mathematically</li>
                                    <li>❌ Does NOT reveal your secret key</li>
                                    <li>❌ Does NOT expose the underlying data</li>
                                </ul>
                            </Card>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleGenerateProof}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                                >
                                    Generate & Verify Proof
                                </Button>
                                <Button
                                    onClick={() => {
                                        setAccessKey("demo.test1")
                                    }}
                                    variant="outline"
                                    className="border-slate-700"
                                >
                                    Use Demo Data
                                </Button>
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    className="border-slate-700"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </>
                    )}

                    {/* Generating Stage */}
                    {stage === 'generating' && (
                        <div className="space-y-4">
                            <Card className="p-6 bg-slate-800/50 border-slate-700">
                                <div className="flex items-center gap-3 mb-4">
                                    <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                                    <span className="text-white font-medium">{progressMessage}</span>
                                </div>

                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>

                                <p className="text-sm text-slate-400 mt-2 text-center">
                                    {progress}% complete
                                </p>
                            </Card>

                            <p className="text-xs text-slate-500 text-center">
                                This process runs entirely in your browser.
                            </p>
                        </div>
                    )}

                    {/* Success Stage */}
                    {stage === 'success' && proofResult && (
                        <div className="space-y-4">
                            <ZKProofResult result={proofResult} />

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleDownloadProof}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Proof
                                </Button>
                                <Button
                                    onClick={handleReset}
                                    variant="outline"
                                    className="border-slate-700"
                                >
                                    Verify Another
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Error Stage */}
                    {stage === 'error' && (
                        <div className="space-y-4">
                            <Card className="p-6 bg-red-900/20 border-red-500/30">
                                <div className="flex items-center gap-3 mb-2">
                                    <XCircle className="w-6 h-6 text-red-400" />
                                    <span className="text-white font-medium">Proof Generation Failed</span>
                                </div>
                                <p className="text-sm text-red-300">{error}</p>
                            </Card>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleReset}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                                >
                                    Try Again
                                </Button>
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    className="border-slate-700"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
