"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getVersions, getAllPublished } from "@/lib/cardano/query"
import { RegistryDatum } from "@/lib/cardano/types"
import { ipfsToHttp } from "@/lib/ipfs"
import { Search, ExternalLink, Package, FileCode, Loader2, Calendar, User, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { snarkjsClient } from "@/lib/zk/snarkjs-client"

export default function VersionHistoryPage() {
    const [searchName, setSearchName] = useState("")
    const [typeFilter, setTypeFilter] = useState<"all" | "contract" | "package">("all")
    const [versions, setVersions] = useState<RegistryDatum[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)
    const [isGeneratingProof, setIsGeneratingProof] = useState(false)

    const handleGenerateProof = async () => {
        setIsGeneratingProof(true)
        try {
            toast.info("Generating ZK Proof... This may take a moment.")
            // Use dummy data for demonstration
            const inputs = {
                nftId: "123456789",
                encryptedCidHash: "abcdef123456789"
            }

            const result = await snarkjsClient.generateOwnershipProof(inputs)
            console.log("Proof generated:", result)

            const isValid = await snarkjsClient.verifyProof(result.proof, result.publicSignals)

            if (isValid) {
                toast.success("ZK Proof Generated & Verified Successfully!")
            } else {
                toast.error("Proof verification failed")
            }
        } catch (error) {
            console.error("ZK Proof error:", error)
            toast.error("Failed to generate ZK proof")
        } finally {
            setIsGeneratingProof(false)
        }
    }

    const handleSearch = async () => {
        if (!searchName.trim()) {
            toast.error("Please enter a contract or package name")
            return
        }

        setIsLoading(true)
        setHasSearched(true)

        try {
            let results: RegistryDatum[] = []

            if (typeFilter === "all") {
                // Search both types
                const contracts = await getVersions(searchName, "contract")
                const packages = await getVersions(searchName, "package")
                results = [...contracts, ...packages]
            } else {
                results = await getVersions(searchName, typeFilter)
            }

            setVersions(results)

            if (results.length === 0) {
                toast.info("No versions found for this name")
            } else {
                toast.success(`Found ${results.length} version(s)`)
            }
        } catch (error) {
            console.error("Search error:", error)
            toast.error("Failed to search versions. Check console for details.")
        } finally {
            setIsLoading(false)
        }
    }

    const loadAllPublished = async () => {
        setIsLoading(true)
        setHasSearched(true)

        try {
            const results = await getAllPublished()
            setVersions(results)
            toast.success(`Loaded ${results.length} published item(s)`)
        } catch (error) {
            console.error("Load error:", error)
            toast.error("Failed to load published items")
        } finally {
            setIsLoading(false)
        }
    }

    const getExplorerUrl = (txHash: string) => {
        const network = process.env.NEXT_PUBLIC_CARDANO_NETWORK?.toLowerCase() || "preprod"
        return `https://${network}.cardanoscan.io/transaction/${txHash}`
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const truncateAddress = (address: string) => {
        if (address.length <= 20) return address
        return `${address.slice(0, 10)}...${address.slice(-8)}`
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
            <Sidebar />

            <div className="ml-64 min-h-screen">
                {/* Header */}
                <header className="flex items-center justify-between p-6 border-b border-white/10 backdrop-blur-sm bg-white/5">
                    <div className="flex-1">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-2xl font-bold text-white"
                        >
                            Version History
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-slate-400 mt-1"
                        >
                            Browse published contracts and packages on Cardano
                        </motion.p>
                    </div>
                    {/* ZK Proof Test Button */}
                    <Button
                        onClick={handleGenerateProof}
                        disabled={isGeneratingProof}
                        variant="outline"
                        className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                    >
                        {isGeneratingProof ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating Proof...
                            </>
                        ) : (
                            <>
                                <ShieldCheck className="w-4 h-4 mr-2" />
                                Test ZK Proof
                            </>
                        )}
                    </Button>
                </header>

                {/* Main content */}
                <main className="p-8">
                    <div className="max-w-6xl mx-auto space-y-6">
                        {/* Search Card */}
                        <Card className="p-6 bg-black/20 backdrop-blur-sm border-white/10">
                            <div className="space-y-4">
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="md:col-span-2">
                                        <Label className="text-white mb-2 block">Search by Name</Label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <Input
                                                value={searchName}
                                                onChange={(e) => setSearchName(e.target.value)}
                                                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                                placeholder="Enter contract or package name..."
                                                className="pl-10 bg-white/5 border-white/10 text-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-white mb-2 block">Type</Label>
                                        <select
                                            value={typeFilter}
                                            onChange={(e) => setTypeFilter(e.target.value as any)}
                                            className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-white"
                                        >
                                            <option value="all">All Types</option>
                                            <option value="contract">Contracts</option>
                                            <option value="package">Packages</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleSearch}
                                        disabled={isLoading}
                                        className="bg-purple-600 hover:bg-purple-700"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Searching...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="w-4 h-4 mr-2" />
                                                Search
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={loadAllPublished}
                                        disabled={isLoading}
                                        variant="outline"
                                        className="border-white/10 text-slate-300"
                                    >
                                        Load All Published
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Results */}
                        {hasSearched && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                {versions.length === 0 ? (
                                    <Card className="p-12 bg-black/20 backdrop-blur-sm border-white/10 text-center">
                                        <Package className="w-16 h-16 mx-auto text-slate-500 mb-4" />
                                        <h3 className="text-xl font-semibold text-white mb-2">No Versions Found</h3>
                                        <p className="text-slate-400">
                                            {searchName ? `No versions found for "${searchName}"` : "No published items yet"}
                                        </p>
                                    </Card>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-lg font-semibold text-white">
                                                {versions.length} Version{versions.length !== 1 ? "s" : ""} Found
                                            </h2>
                                        </div>

                                        <div className="space-y-3">
                                            {versions.map((version, index) => (
                                                <motion.div
                                                    key={`${version.name}-${version.version}-${index}`}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <Card className="p-6 bg-black/20 backdrop-blur-sm border-white/10 hover:border-purple-500/30 transition-all">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1 space-y-3">
                                                                <div className="flex items-center gap-3">
                                                                    {version.type === "contract" ? (
                                                                        <FileCode className="w-5 h-5 text-purple-400" />
                                                                    ) : (
                                                                        <Package className="w-5 h-5 text-cyan-400" />
                                                                    )}
                                                                    <h3 className="text-xl font-semibold text-white">
                                                                        {version.name}
                                                                    </h3>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={
                                                                            version.type === "contract"
                                                                                ? "border-purple-500/30 text-purple-300"
                                                                                : "border-cyan-500/30 text-cyan-300"
                                                                        }
                                                                    >
                                                                        {version.type}
                                                                    </Badge>
                                                                    <Badge variant="outline" className="border-white/20 text-white">
                                                                        v{version.version}
                                                                    </Badge>
                                                                </div>

                                                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                                                    <div className="flex items-center gap-2 text-slate-400">
                                                                        <User className="w-4 h-4" />
                                                                        <span>Publisher:</span>
                                                                        <code className="text-slate-300">
                                                                            {truncateAddress(version.publisher)}
                                                                        </code>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-slate-400">
                                                                        <Calendar className="w-4 h-4" />
                                                                        <span>{formatDate(version.timestamp)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-wrap gap-2">
                                                                <a
                                                                    href={ipfsToHttp(version.sourceCID)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                                                >
                                                                    📦 Source IPFS
                                                                    <ExternalLink className="w-3 h-3" />
                                                                </a>
                                                                <span className="text-slate-600">•</span>
                                                                <a
                                                                    href={ipfsToHttp(version.metadataCID)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                                                >
                                                                    📄 Metadata IPFS
                                                                    <ExternalLink className="w-3 h-3" />
                                                                </a>
                                                            </div>
                                                        </div>

                                                    </Card>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
