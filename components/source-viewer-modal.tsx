"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Copy, ExternalLink, Loader2, File, FileCode, FileText } from "lucide-react"
import { ipfsToHttp } from "@/lib/ipfs"
import { toast } from "sonner"
import JSZip from "jszip"

interface SourceViewerModalProps {
    isOpen: boolean
    onClose: () => void
    sourceCID: string
    title: string
}

interface ZipFile {
    name: string
    content: string
}

export function SourceViewerModal({ isOpen, onClose, sourceCID, title }: SourceViewerModalProps) {
    const [sourceCode, setSourceCode] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string>("")
    const [hasFetched, setHasFetched] = useState(false)

    // ZIP file state
    const [isZipFile, setIsZipFile] = useState(false)
    const [zipFiles, setZipFiles] = useState<ZipFile[]>([])
    const [selectedFile, setSelectedFile] = useState<string | null>(null)

    const getFileIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase()
        switch (ext) {
            case 'sol':
            case 'js':
            case 'ts':
            case 'tsx':
            case 'jsx':
                return <FileCode className="w-4 h-4" />
            case 'md':
            case 'txt':
                return <FileText className="w-4 h-4" />
            default:
                return <File className="w-4 h-4" />
        }
    }

    const fetchSourceCode = async () => {
        // Prevent repeated fetch attempts
        if (isLoading || hasFetched) return

        setIsLoading(true)
        setError("")
        setIsZipFile(false)
        setZipFiles([])
        setSelectedFile(null)

        try {
            const url = ipfsToHttp(sourceCID)
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error("Failed to fetch source code from IPFS")
            }

            const arrayBuffer = await response.arrayBuffer()

            // Check if it's a ZIP file (PK signature)
            const uint8Array = new Uint8Array(arrayBuffer)
            const isPK = uint8Array[0] === 0x50 && uint8Array[1] === 0x4B

            if (isPK) {
                // It's a ZIP file, extract it
                try {
                    const zip = await JSZip.loadAsync(arrayBuffer)
                    const files: ZipFile[] = []

                    for (const [filename, file] of Object.entries(zip.files)) {
                        if (!file.dir) {
                            const content = await file.async('string')
                            files.push({ name: filename, content })
                        }
                    }

                    setZipFiles(files)
                    setIsZipFile(true)

                    // Auto-select first file
                    if (files.length > 0) {
                        setSelectedFile(files[0].name)
                    }
                } catch (zipErr) {
                    console.error("Error extracting ZIP:", zipErr)
                    throw new Error("Failed to extract ZIP file")
                }
            } else {
                // Not a ZIP, treat as text
                const text = new TextDecoder().decode(arrayBuffer)

                // Try to parse and pretty-print JSON
                try {
                    const json = JSON.parse(text)
                    setSourceCode(JSON.stringify(json, null, 2))
                } catch {
                    // Not JSON, display as-is
                    setSourceCode(text)
                }
            }

            setHasFetched(true)
        } catch (err: any) {
            console.error("Error fetching source:", err)

            // Provide more helpful error messages for CORS issues
            if (err.message?.includes("Failed to fetch") || err.name === "TypeError") {
                setError(
                    "Unable to fetch from IPFS gateway. This is likely due to CORS restrictions. " +
                    "Try viewing the file directly in Pinata using the button below."
                )
            } else {
                setError(err.message || "Failed to load source code")
            }
            setHasFetched(true)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        // Reset state when modal opens with a new CID
        if (isOpen) {
            if (!hasFetched && !isLoading && !sourceCode && zipFiles.length === 0) {
                fetchSourceCode()
            }
        } else {
            // Reset when modal closes
            setSourceCode("")
            setError("")
            setHasFetched(false)
            setIsZipFile(false)
            setZipFiles([])
            setSelectedFile(null)
        }
    }, [isOpen, sourceCID])

    const handleCopy = () => {
        let textToCopy = ""

        if (isZipFile && selectedFile) {
            const file = zipFiles.find(f => f.name === selectedFile)
            textToCopy = file?.content || ""
        } else {
            textToCopy = sourceCode
        }

        navigator.clipboard.writeText(textToCopy)
        toast.success("Source code copied to clipboard")
    }

    const handleOpenIPFS = () => {
        // Extract CID from sourceCID (remove ipfs:// if present)
        const cid = sourceCID.startsWith('ipfs://') ? sourceCID.replace('ipfs://', '') : sourceCID
        // Open in Pinata file manager instead of gateway
        window.open(`https://app.pinata.cloud/pinmanager?search=${cid}`, '_blank')
    }

    const getDisplayContent = () => {
        if (isZipFile && selectedFile) {
            const file = zipFiles.find(f => f.name === selectedFile)
            return file?.content || ""
        }
        return sourceCode
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
                        className="w-full max-w-6xl max-h-[90vh] flex flex-col"
                    >
                        <Card className="bg-slate-900/95 border-slate-700 flex flex-col h-full">
                            <div className="flex items-center justify-between p-6 border-b border-slate-700">
                                <div>
                                    <h2 className="text-xl font-bold text-white">{title}</h2>
                                    <p className="text-sm text-slate-400 mt-1">
                                        {isZipFile ? `Package Archive (${zipFiles.length} files)` : 'Source Code Viewer'}
                                    </p>
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
                                    disabled={(!sourceCode && !selectedFile) || isLoading}
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

                            <div className="flex-1 overflow-hidden flex">
                                {/* File browser sidebar for ZIP files */}
                                {isZipFile && zipFiles.length > 0 && (
                                    <div className="w-64 border-r border-slate-700 overflow-y-auto bg-slate-950/50">
                                        <div className="p-3">
                                            <p className="text-xs font-semibold text-slate-400 mb-2 uppercase">Files</p>
                                            <div className="space-y-1">
                                                {zipFiles.map((file) => (
                                                    <button
                                                        key={file.name}
                                                        onClick={() => setSelectedFile(file.name)}
                                                        className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${selectedFile === file.name
                                                                ? 'bg-purple-600 text-white'
                                                                : 'text-slate-300 hover:bg-slate-800'
                                                            }`}
                                                    >
                                                        {getFileIcon(file.name)}
                                                        <span className="truncate">{file.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Content area */}
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
                                                    onClick={() => {
                                                        setHasFetched(false)
                                                        setError("")
                                                        fetchSourceCode()
                                                    }}
                                                    variant="outline"
                                                    className="border-slate-600 text-slate-300"
                                                >
                                                    Retry
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {!isLoading && !error && (isZipFile || sourceCode) && (
                                        <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
                                            {isZipFile && selectedFile && (
                                                <div className="mb-3 pb-3 border-b border-slate-700">
                                                    <p className="text-xs text-slate-500 font-mono">{selectedFile}</p>
                                                </div>
                                            )}
                                            <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap overflow-x-auto">
                                                {getDisplayContent()}
                                            </pre>
                                        </div>
                                    )}

                                    {!isLoading && !error && !sourceCode && zipFiles.length === 0 && (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-slate-500">No source code available</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
