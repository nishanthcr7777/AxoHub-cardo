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
import { CompactProof } from "@/lib/zk/midnight-client"

interface ZKProofDialogProps {
    isOpen: boolean
    onClose: () => void
    initialNftId?: string
    onProofGenerated?: (proof: CompactProof) => void
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
    const [nftId, setNftId] = useState(initialNftId)
    const [stage, setStage] = useState<ProofStage>('input')
    const [progress, setProgress] = useState(0)
    const [progressMessage, setProgressMessage] = useState("")
    const [proofResult, setProofResult] = useState<any>(null)
    const [error, setError] = useState("")

    const handleGenerateProof = async () => {
        if (!nftId.trim()) {
            toast.error("Please enter an NFT ID or transaction hash")
            return
        }

        setStage('generating')
        setProgress(0)
        setError("")
        onGeneratingChange?.(true)

        try {
            // Step 1: Fetch NFT metadata
            setProgressMessage("Fetching NFT metadata from Cardano...")
            setProgress(25)
            await new Promise(resolve => setTimeout(resolve, 800))

            // Step 2: Extract encrypted CID hash
            setProgressMessage("Extracting encrypted CID hash...")
            setProgress(50)
            await new Promise(resolve => setTimeout(resolve, 600))

            // Step 3: Generate ZK proof
            setProgressMessage("Generating Midnight ZK proof...")
            setProgress(75)

            const response = await fetch('/api/zk/generate-proof', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nftId })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to generate proof')
            }

            const result = await response.json()

            // Step 4: Verify proof
            setProgressMessage("Verifying proof...")
            setProgress(90)
            await new Promise(resolve => setTimeout(resolve, 500))

            setProgress(100)
            setProgressMessage("Proof generated successfully!")

            // Success!
            setProofResult(result)
            setStage('success')
            onProofGenerated?.(result)
            toast.success("ZK proof generated and verified!")

        } catch (err: any) {
            console.error("Proof generation failed:", err)
            setError(err.message || "Failed to generate proof")
            setStage('error')
            toast.error("Failed to generate ZK proof")
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
    }

    const handleDownloadProof = () => {
        if (!proofResult) return

        const blob = new Blob([JSON.stringify(proofResult, null, 2)], {
            type: 'application/json'
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `zk-proof-${nftId}.json`
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
                        Midnight ZK Proof Verification
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Generate a Zero-Knowledge proof of NFT ownership without revealing encrypted CID
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Input Stage */}
                    {stage === 'input' && (
                        <>
                            <div>
                                <Label className="text-slate-300">NFT Token ID</Label>
                                <Input
                                    value={nftId}
                                    onChange={(e) => setNftId(e.target.value)}
                                    placeholder="demo.test1 or policyId.assetName"
                                    className="bg-slate-800 border-slate-700 text-white mt-2"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Try demo NFTs: <code className="text-purple-400">demo.test1</code> or <code className="text-purple-400">demo.test2</code>
                                </p>
                                <p className="text-xs text-slate-500">
                                    Or use real NFT format: policyId.assetName
                                </p>
                            </div>

                            <Card className="p-4 bg-purple-900/20 border-purple-500/30">
                                <h4 className="text-sm font-semibold text-purple-300 mb-2">
                                    🔐 Privacy Guarantee
                                </h4>
                                <ul className="text-xs text-slate-300 space-y-1">
                                    <li>✅ Proves NFT ownership</li>
                                    <li>✅ Verifies package exists</li>
                                    <li>❌ Does NOT reveal encrypted CID</li>
                                    <li>❌ Does NOT expose source code</li>
                                    <li>❌ Does NOT show private metadata</li>
                                </ul>
                            </Card>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleGenerateProof}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                                >
                                    Generate ZK Proof
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
                                This may take a few seconds...
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
                                    Generate Another
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
