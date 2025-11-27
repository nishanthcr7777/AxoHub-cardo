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
import { PackageMetadata } from "@/lib/cardano/types"
import { Upload, Package, Loader2, CheckCircle2, ExternalLink } from "lucide-react"
import { toast } from "sonner"

type Step = "upload" | "metadata" | "ipfs" | "cardano" | "success"

export function PublishPackageForm() {
  const { isConnected, address, lucid } = useCardanoWallet()
  const [currentStep, setCurrentStep] = useState<Step>("upload")
  const [isProcessing, setIsProcessing] = useState(false)

  // Form data
  const [packageFile, setPackageFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState<PackageMetadata>({
    name: "",
    version: "",
    description: "",
    author: "",
    license: "MIT",
    dependencies: {},
    repository: "",
  })

  // Result data
  const [sourceCID, setSourceCID] = useState("")
  const [metadataCID, setMetadataCID] = useState("")
  const [txHash, setTxHash] = useState("")

  const handleFileUpload = (file: File) => {
    setPackageFile(file)
    // Auto-fill package name from filename if empty
    if (!metadata.name) {
      const nameFromFile = file.name.replace(/\.(zip|tar\.gz|tgz)$/i, "")
      setMetadata((prev) => ({ ...prev, name: nameFromFile }))
    }
  }

  const handleUploadToIPFS = async () => {
    if (!packageFile) {
      toast.error("Please upload a package file")
      return
    }

    setIsProcessing(true)
    setCurrentStep("ipfs")

    try {
      // Upload package file to IPFS
      toast.info("Uploading package to IPFS...")
      const pkgCID = await uploadToIPFS(packageFile)
      setSourceCID(pkgCID)

      // Upload metadata JSON to IPFS
      toast.info("Uploading metadata to IPFS...")
      const metadataWithCID = {
        ...metadata,
        packageCID: pkgCID,
      }
      const metaCID = await uploadJSONToIPFS(metadataWithCID)
      setMetadataCID(metaCID)

      toast.success("Package uploaded to IPFS successfully!")
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
        type: "package",
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
      toast.success("Package published to Cardano successfully!")
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
        {/* Step 1: Upload Package */}
        {currentStep === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Upload Package</h2>
              <p className="text-slate-400">Upload your package file (ZIP, TAR.GZ)</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-white">Package File *</Label>
                <div className="mt-2">
                  <Input
                    type="file"
                    accept=".zip,.tar.gz,.tgz"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="bg-white/5 border-white/10 text-white"
                  />
                  {packageFile && (
                    <p className="text-sm text-green-400 mt-2">✓ {packageFile.name} ({(packageFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={() => setCurrentStep("metadata")}
              disabled={!packageFile}
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
              <h2 className="text-2xl font-bold text-white mb-2">Package Metadata</h2>
              <p className="text-slate-400">Provide details about your package</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-white">Package Name *</Label>
                <Input
                  value={metadata.name}
                  onChange={(e) => setMetadata((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="my-awesome-package"
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
                  placeholder="Describe your package..."
                  className="bg-white/5 border-white/10 text-white"
                  rows={3}
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

              <div>
                <Label className="text-white">Repository URL</Label>
                <Input
                  value={metadata.repository}
                  onChange={(e) => setMetadata((prev) => ({ ...prev, repository: e.target.value }))}
                  placeholder="https://github.com/username/repo"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label className="text-white">License</Label>
                <Input
                  value={metadata.license}
                  onChange={(e) => setMetadata((prev) => ({ ...prev, license: e.target.value }))}
                  placeholder="MIT"
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
              <p className="text-slate-400">Please wait while we upload your package...</p>
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
              <p className="text-slate-400">Package uploaded to IPFS successfully!</p>
            </div>

            <div className="space-y-3 bg-white/5 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-slate-400">Package CID:</span>
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
              <h2 className="text-3xl font-bold text-white mb-2">Package Published!</h2>
              <p className="text-slate-400">Your package is now on Cardano registry</p>
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
                <p className="text-sm text-slate-400 mb-1">Package IPFS</p>
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
                setPackageFile(null)
                setMetadata({
                  name: "",
                  version: "",
                  description: "",
                  author: "",
                  license: "MIT",
                  dependencies: {},
                  repository: "",
                })
                setSourceCID("")
                setMetadataCID("")
                setTxHash("")
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Publish Another Package
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
