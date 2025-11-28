"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useCardanoWallet } from "@/contexts/CardanoWalletContext"
import { queryAccessNFT } from "@/lib/cardano/nft"
import { decryptSource } from "@/lib/crypto"
import { ipfsToHttp } from "@/lib/ipfs"
import { Loader2, Lock, Unlock, Copy, ExternalLink } from "lucide-react"
import { toast } from "sonner"

export function PrivateSourcesViewer() {
    const { lucid } = useCardanoWallet()
    const [passkey, setPasskey] = useState("")
    const [isUnlocking, setIsUnlocking] = useState(false)
    const [unlockedSource, setUnlockedSource] = useState<{
        sourceCode: string
        metadata: any
    } | null>(null)

    const handleUnlock = async () => {
        if (!passkey.trim()) {
            toast.error("Please enter your NFT access key")
            return
        }

        if (!lucid) {
            toast.error("Please connect your wallet first")
            return
        }

        setIsUnlocking(true)

        try {
            console.log("[PrivateViewer] Querying NFT:", passkey)

            // 1. Query NFT from Cardano
            const nftMetadata = await queryAccessNFT(passkey, lucid)

            if (!nftMetadata) {
                throw new Error("Invalid access key or NFT not found")
            }

            console.log("[PrivateViewer] NFT found:", nftMetadata)

            // 2. Fetch encrypted source from IPFS
            const encryptedUrl = ipfsToHttp(`ipfs://${nftMetadata.encryptedCID}`)
            console.log("[PrivateViewer] Fetching encrypted source from:", encryptedUrl)

            const response = await fetch(encryptedUrl)
            if (!response.ok) {
                throw new Error("Failed to fetch encrypted source from IPFS")
            }

            const encryptedData = new Uint8Array(await response.arrayBuffer())

            // 3. Decrypt source code
            console.log("[PrivateViewer] Decrypting source...")
            const sourceCode = await decryptSource(encryptedData, nftMetadata.encryptionKey)

            setUnlockedSource({
                sourceCode,
                metadata: nftMetadata
            })

            toast.success("Private source code decrypted successfully")

        } catch (error: any) {
            console.error("[PrivateViewer] Unlock error:", error)
            toast.error(error.message || "Invalid access key or network error")
        } finally {
            setIsUnlocking(false)
        }
    }

    const handleCopySource = () => {
        if (unlockedSource) {
            navigator.clipboard.writeText(unlockedSource.sourceCode)
            toast.success("Source code copied to clipboard")
        }
    }

    const handleReset = () => {
        setUnlockedSource(null)
        setPasskey("")
    }

    return (
        <div className="space-y-6">
            {!unlockedSource ? (
                // Passkey Input
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="p-8 bg-black/20 backdrop-blur-sm border-white/10">
                        <div className="text-center mb-6">
                            <Lock className="w-16 h-16 mx-auto text-purple-500 mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Private Sources
                            </h2>
                            <p className="text-slate-400">
                                Enter your NFT access key to unlock private source code
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="passkey" className="text-white">
                                    NFT Access Key (Passkey)
                                </Label>
                                <Input
                                    id="passkey"
                                    value={passkey}
                                    onChange={(e) => setPasskey(e.target.value)}
                                    placeholder="Paste your NFT token ID here..."
                                    className="bg-slate-800/50 border-slate-600 text-white font-mono text-sm"
                                    disabled={isUnlocking}
                                />
                                <p className="text-xs text-slate-500">
                                    This is the NFT token ID you received when submitting private source
                                </p>
                            </div>

                            <Button
                                onClick={handleUnlock}
                                disabled={isUnlocking || !passkey.trim()}
                                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500"
                            >
                                {isUnlocking ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Unlocking...
                                    </>
                                ) : (
                                    <>
                                        <Unlock className="w-4 h-4 mr-2" />
                                        Unlock Source Code
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            ) : (
                // Unlocked Source Display
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                >
                    {/* Metadata Card */}
                    <Card className="p-6 bg-black/20 backdrop-blur-sm border-green-500/30">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Unlock className="w-5 h-5 text-green-500" />
                                    <h3 className="text-xl font-bold text-white">
                                        {unlockedSource.metadata.name}
                                    </h3>
                                    <Badge variant="outline" className="border-green-500/30 text-green-300">
                                        v{unlockedSource.metadata.version}
                                    </Badge>
                                </div>
                                <p className="text-sm text-slate-400">
                                    🔒 Private Source Code (Decrypted)
                                </p>
                            </div>
                            <Button
                                onClick={handleReset}
                                variant="outline"
                                size="sm"
                                className="border-slate-600 text-slate-300"
                            >
                                Lock Again
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-slate-400">Compiler:</span>
                                <span className="text-white ml-2">{unlockedSource.metadata.compiler}</span>
                            </div>
                            <div>
                                <span className="text-slate-400">License:</span>
                                <span className="text-white ml-2">{unlockedSource.metadata.license}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-slate-400">Owner:</span>
                                <span className="text-white ml-2 font-mono text-xs break-all">
                                    {unlockedSource.metadata.owner}
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Source Code Card */}
                    <Card className="p-6 bg-black/20 backdrop-blur-sm border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-white">Source Code</h4>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleCopySource}
                                    size="sm"
                                    variant="outline"
                                    className="border-slate-600 text-slate-300"
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy
                                </Button>
                                <Button
                                    onClick={() => window.open(ipfsToHttp(`ipfs://${unlockedSource.metadata.encryptedCID}`), '_blank')}
                                    size="sm"
                                    variant="outline"
                                    className="border-slate-600 text-slate-300"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    IPFS
                                </Button>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                            <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap">
                                {unlockedSource.sourceCode}
                            </pre>
                        </div>

                        <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                            <p className="text-xs text-green-300">
                                ✅ Source code verified and decrypted successfully
                            </p>
                        </div>
                    </Card>
                </motion.div>
            )}
        </div>
    )
}
