"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Copy, ExternalLink, Loader2 } from "lucide-react"
import { ipfsToHttp } from "@/lib/ipfs"
import { toast } from "sonner"

interface SourceViewerModalProps {
    isOpen: boolean
    onClose: () => void
    sourceCID: string
    title: string
}

export function SourceViewerModal({ isOpen, onClose, sourceCID, title }: SourceViewerModalProps) {
    const [sourceCode, setSourceCode] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string>("")

    const fetchSourceCode = async () => {
        setIsLoading(true)
        setError("")

        try {
            const url = ipfsToHttp(sourceCID)
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error("Failed to fetch source code from IPFS")
            }

            const text = await response.text()

            // Try to parse and pretty-print JSON
            try {
                const json = JSON.parse(text)
                setSourceCode(JSON.stringify(json, null, 2))
            } catch {
                // Not JSON, display as-is
                setSourceCode(text)
            }
        } catch (err: any) {
            console.error("Error fetching source:", err)
            setError(err.message || "Failed to load source code")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen && !sourceCode && !isLoading) {
            fetchSourceCode()
        }
    }, [isOpen, sourceCID])

    const handleCopy = () => {
        navigator.clipboard.writeText(sourceCode)
        toast.success("Source code copied to clipboard")
    }

    const handleOpenIPFS = () => {
        // Extract CID from sourceCID (remove ipfs:// if present)
        const cid = sourceCID.startsWith('ipfs://') ? sourceCID.replace('ipfs://', '') : sourceCID
        // Open in Pinata file manager instead of gateway
        window.open(`https://app.pinata.cloud/pinmanager?search=${cid}`, '_blank')
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-4xl max-h-[90vh] flex flex-col"
                    >
                        <Card className="bg-slate-900/95 border-slate-700 flex flex-col h-full">
                            <div className="flex items-center justify-between p-6 border-b border-slate-700">
                                <div>
                                    <h2 className="text-xl font-bold text-white">{title}</h2>
                                    <p className="text-sm text-slate-400 mt-1">Source Code Viewer</p>
                                </div>
                                <Button
                                    onClick={onClose}
                                    variant="ghost"
                                    size="icon"
                                    className="text-slate-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-700">
                                <Button
                                    onClick={handleCopy}
                                    size="sm"
                                    variant="outline"
                                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                                    disabled={!sourceCode || isLoading}
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy
                                </Button>
                                <Button
                                    onClick={handleOpenIPFS}
                                    size="sm"
                                    variant="outline"
                                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    View in Pinata
                                </Button>
                                <div className="ml-auto text-xs text-slate-500 font-mono">
                                    CID: {sourceCID.slice(0, 12)}...{sourceCID.slice(-8)}
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto p-6">
                                {isLoading && (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
                                            <p className="text-slate-400">Loading source code from IPFS...</p>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <p className="text-red-400 mb-4">❌ {error}</p>
                                            <Button
                                                onClick={fetchSourceCode}
                                                variant="outline"
                                                className="border-slate-600 text-slate-300"
                                            >
                                                Retry
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {!isLoading && !error && sourceCode && (
                                    <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
                                        <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap overflow-x-auto">
                                            {sourceCode}
                                        </pre>
                                    </div>
                                )}

                                {!isLoading && !error && !sourceCode && (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-slate-500">No source code available</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
