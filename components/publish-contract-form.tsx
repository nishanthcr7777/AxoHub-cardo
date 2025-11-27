"use client"

import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCardanoWallet } from "@/contexts/CardanoWalletContext"
import { uploadToIPFS, uploadJSONToIPFS, ipfsToHttp } from "@/lib/ipfs"
import { buildPublishTransaction } from "@/lib/cardano/publish"
import { savePublishedItem } from "@/lib/cardano/query"
import { ContractMetadata } from "@/lib/cardano/types"
import { Upload, FileCode, Loader2, CheckCircle2, ExternalLink } from "lucide-react"
import { toast } from "sonner"

type Step = "upload" | "metadata" | "ipfs" | "cardano" | "success"

export function PublishContractForm() {
    const { isConnected, address, lucid } = useCardanoWallet()
    const [currentStep, setCurrentStep] = useState<Step>("upload")
    const [isProcessing, setIsProcessing] = useState(false)

    // Form data
    const [abiFile, setAbiFile] = useState<File | null>(null)
    const [bytecodeFile, setBytecodeFile] = useState<File | null>(null)
    const [metadata, setMetadata] = useState<ContractMetadata>({
        name: "",
        version: "",
        description: "",
        abi: null,
        bytecode: "",
        compiler: "",
        license: "MIT",
        author: "",
    })

    // Result data
    const [sourceCID, setSourceCID] = useState("")
    const [metadataCID, setMetadataCID] = useState("")
    const [txHash, setTxHash] = useState("")

    const handleFileUpload = (type: "abi" | "bytecode", file: File) => {
        if (type === "abi") {
            setAbiFile(file)
            // Read and parse ABI
            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const abi = JSON.parse(e.target?.result as string)
                    setMetadata((prev) => ({ ...prev, abi }))
                } catch (error) {
                    toast.error("Invalid ABI JSON file")
                }
            }
            reader.readAsText(file)
        } else {
            setBytecodeFile(file)
            // Read bytecode
            const reader = new FileReader()
            reader.onload = (e) => {
                setMetadata((prev) => ({ ...prev, bytecode: e.target?.result as string }))
            }
            reader.readAsText(file)
        }
    }

    const handleUploadToIPFS = async () => {
        if (!abiFile || !bytecodeFile) {
            toast.error("Please upload both ABI and bytecode files")
            return
        }

        setIsProcessing(true)
        setCurrentStep("ipfs")

        try {
            // Upload source files to IPFS
            toast.info("Uploading files to IPFS...")
            const abiCID = await uploadToIPFS(abiFile)
            const bytecodeCID = await uploadToIPFS(bytecodeFile)

            // Create combined source CID (for now, use ABI CID as main)
            setSourceCID(abiCID)

            // Upload metadata JSON to IPFS
            toast.info("Uploading metadata to IPFS...")
            const metadataWithCIDs = {
                ...metadata,
                abiCID,
                bytecodeCID,
            }
            const metaCID = await uploadJSONToIPFS(metadataWithCIDs)
            setMetadataCID(metaCID)

            toast.success("Files uploaded to IPFS successfully!")
            setCurrentStep("cardano")
        } catch (error) {
            console.error("IPFS upload error:", error)
            toast.error("Failed to upload to IPFS. Check your Pinata API keys.")
            setCurrentStep("metadata")
        } finally {
            setIsProcessing(false)
        }
    }

    const handlePublishToCardano = async () => {
        if (!isConnected || !address || !lucid) {
            toast.error("Please connect your wallet first")
            return
        }

        if (!sourceCID || !metadataCID) {
            toast.error("IPFS upload incomplete")
            return
        }

        setIsProcessing(true)

        try {
            toast.info("Building Cardano transaction...")

            const { tx, datum } = await buildPublishTransaction({
                type: "contract",
                name: metadata.name,
                version: metadata.version,
                sourceCID,
                metadataCID,
                walletAddress: address,
                lucid,
            })

            toast.info("Please sign the transaction in your wallet...")
            const signedTx = await tx.sign().complete()

            toast.info("Submitting to Cardano...")
            const txHashResult = await signedTx.submit()

            // Save to localStorage for Phase 1
            savePublishedItem(datum)

            setTxHash(txHashResult)
            setCurrentStep("success")
            toast.success("Contract published to Cardano successfully!")
        } catch (error) {
            console.error("Cardano publish error:", error)
            toast.error("Failed to publish to Cardano. Check console for details.")
        } finally {
            setIsProcessing(false)
        }
    }

    const getExplorerUrl = (txHash: string) => {
        const network = process.env.NEXT_PUBLIC_CARDANO_NETWORK?.toLowerCase() || "preprod"
        return `https://${network}.cardanoscan.io/transaction/${txHash}`
    }

    return (
        <Card className="p-8 bg-black/20 backdrop-blur-sm border-white/10">
            <AnimatePresence mode="wait">
                {/* Step 1: Upload Files */}
                {currentStep === "upload" && (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Upload Contract Files</h2>
                            <p className="text-slate-400">Upload your contract ABI and bytecode</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label className="text-white">ABI File (JSON)</Label>
                                <div className="mt-2">
                                    <Input
                                        type="file"
                                        accept=".json"
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload("abi", e.target.files[0])}
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                    {abiFile && (
                                        <p className="text-sm text-green-400 mt-2">✓ {abiFile.name}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label className="text-white">Bytecode File</Label>
                                <div className="mt-2">
                                    <Input
                                        type="file"
                                        accept=".txt,.bin"
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload("bytecode", e.target.files[0])}
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                    {bytecodeFile && (
                                        <p className="text-sm text-green-400 mt-2">✓ {bytecodeFile.name}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={() => setCurrentStep("metadata")}
                            disabled={!abiFile || !bytecodeFile}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                            Continue to Metadata
                        </Button>
                    </motion.div>
                )}

                {/* Step 2: Metadata */}
                {currentStep === "metadata" && (
                    <motion.div
                        key="metadata"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Contract Metadata</h2>
                            <p className="text-slate-400">Provide details about your contract</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label className="text-white">Contract Name *</Label>
                                <Input
                                    value={metadata.name}
                                    onChange={(e) => setMetadata((prev) => ({ ...prev, name: e.target.value }))}
                                    placeholder="MyContract"
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>

                            <div>
                                <Label className="text-white">Version *</Label>
                                <Input
                                    value={metadata.version}
                                    onChange={(e) => setMetadata((prev) => ({ ...prev, version: e.target.value }))}
                                    placeholder="1.0.0"
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>

                            <div>
                                <Label className="text-white">Description *</Label>
                                <Textarea
                                    value={metadata.description}
                                    onChange={(e) => setMetadata((prev) => ({ ...prev, description: e.target.value }))}
                                    placeholder="Describe your contract..."
                                    className="bg-white/5 border-white/10 text-white"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label className="text-white">Compiler</Label>
                                <Input
                                    value={metadata.compiler}
                                    onChange={(e) => setMetadata((prev) => ({ ...prev, compiler: e.target.value }))}
                                    placeholder="solc 0.8.20"
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>

                            <div>
                                <Label className="text-white">Author</Label>
                                <Input
                                    value={metadata.author}
                                    onChange={(e) => setMetadata((prev) => ({ ...prev, author: e.target.value }))}
                                    placeholder="Your name or organization"
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={() => setCurrentStep("upload")}
                                variant="outline"
                                className="flex-1 border-white/10 text-slate-300"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleUploadToIPFS}
                                disabled={!metadata.name || !metadata.version || !metadata.description}
                                className="flex-1 bg-purple-600 hover:bg-purple-700"
                            >
                                Upload to IPFS
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: IPFS Upload */}
                {currentStep === "ipfs" && (
                    <motion.div
                        key="ipfs"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6 text-center"
                    >
                        <Loader2 className="w-16 h-16 mx-auto text-purple-500 animate-spin" />
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Uploading to IPFS</h2>
                            <p className="text-slate-400">Please wait while we upload your files...</p>
                        </div>
                    </motion.div>
                )}

                {/* Step 4: Cardano Publish */}
                {currentStep === "cardano" && (
                    <motion.div
                        key="cardano"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Publish to Cardano</h2>
                            <p className="text-slate-400">Files uploaded to IPFS successfully!</p>
                        </div>

                        <div className="space-y-3 bg-white/5 p-4 rounded-lg">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Source CID:</span>
                                <a
                                    href={ipfsToHttp(sourceCID)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                >
                                    {sourceCID.slice(0, 20)}...
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Metadata CID:</span>
                                <a
                                    href={ipfsToHttp(metadataCID)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                >
                                    {metadataCID.slice(0, 20)}...
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>

                        {!isConnected ? (
                            <div className="text-center p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                                <p className="text-orange-300">Please connect your wallet to publish to Cardano</p>
                            </div>
                        ) : (
                            <Button
                                onClick={handlePublishToCardano}
                                disabled={isProcessing}
                                className="w-full bg-purple-600 hover:bg-purple-700"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Publishing...
                                    </>
                                ) : (
                                    "Publish to Cardano Registry"
                                )}
                            </Button>
                        )}
                    </motion.div>
                )}

                {/* Step 5: Success */}
                {currentStep === "success" && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6 text-center"
                    >
                        <CheckCircle2 className="w-20 h-20 mx-auto text-green-500" />
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">Contract Published!</h2>
                            <p className="text-slate-400">Your contract is now on Cardano registry</p>
                        </div>

                        <div className="space-y-3 bg-white/5 p-6 rounded-lg text-left">
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Transaction Hash</p>
                                <a
                                    href={getExplorerUrl(txHash)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-400 hover:text-purple-300 flex items-center gap-2 break-all"
                                >
                                    {txHash}
                                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                                </a>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Source IPFS</p>
                                <a
                                    href={ipfsToHttp(sourceCID)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-400 hover:text-purple-300 flex items-center gap-2 break-all"
                                >
                                    {sourceCID}
                                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                                </a>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Metadata IPFS</p>
                                <a
                                    href={ipfsToHttp(metadataCID)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-400 hover:text-purple-300 flex items-center gap-2 break-all"
                                >
                                    {metadataCID}
                                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                                </a>
                            </div>
                        </div>

                        <Button
                            onClick={() => {
                                setCurrentStep("upload")
                                setAbiFile(null)
                                setBytecodeFile(null)
                                setMetadata({
                                    name: "",
                                    version: "",
                                    description: "",
                                    abi: null,
                                    bytecode: "",
                                    compiler: "",
                                    license: "MIT",
                                    author: "",
                                })
                                setSourceCID("")
                                setMetadataCID("")
                                setTxHash("")
                            }}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            Publish Another Contract
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    )
}
