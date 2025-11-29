"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getVersions, getAllPublished } from "@/lib/cardano/query"
import { RegistryDatum, HydraCommit } from "@/lib/cardano/types"
import { ipfsToHttp } from "@/lib/ipfs"
import { Search, ExternalLink, Package, FileCode, Loader2, Calendar, User, GitCommit, Send, RefreshCw, Wallet } from "lucide-react"
import { toast } from "sonner"
import { CodeEditor } from "@/components/code-editor"
import { CommitDialog } from "@/components/commit-dialog"
import { CommitHistory } from "@/components/commit-history"
import { StatusIndicator } from "@/components/status-indicator"
import { generateDiff, calculateStats } from "@/lib/hydra/diff"
import { batchPublishCommits } from "@/lib/cardano/batch-publish"

export default function VersionHistoryPage() {
    const [searchName, setSearchName] = useState("")
    const [typeFilter, setTypeFilter] = useState<"all" | "contract" | "package">("all")
    const [versions, setVersions] = useState<RegistryDatum[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    // Editor State
    const [code, setCode] = useState("")
    const [originalCode, setOriginalCode] = useState("")
    const [isCommitDialogOpen, setIsCommitDialogOpen] = useState(false)
    const [stats, setStats] = useState({ added: 0, removed: 0 })
    const [hasChanges, setHasChanges] = useState(false)
    const [editorLanguage, setEditorLanguage] = useState<"plutus" | "aiken" | "solidity">("aiken")

    // Hydra State
    const [commits, setCommits] = useState<HydraCommit[]>([])
    const [isLoadingCommits, setIsLoadingCommits] = useState(false)
    const [currentPackageId, setCurrentPackageId] = useState("pkg_demo_123") // Mock ID for demo
    const [isPushing, setIsPushing] = useState(false)

    useEffect(() => {
        if (code !== originalCode) {
            const diff = generateDiff(originalCode, code)
            setStats(calculateStats(diff))
            setHasChanges(true)
        } else {
            setHasChanges(false)
        }
    }, [code, originalCode])

    // Load commits on mount
    useEffect(() => {
        loadCommits()
    }, [currentPackageId])

    const loadCommits = async () => {
        setIsLoadingCommits(true)
        try {
            const res = await fetch(`/api/hydra/commits/${currentPackageId}`)
            const data = await res.json()
            if (data.success) {
                setCommits(data.commits)
                // If we have commits, set the latest code
                if (data.commits.length > 0 && !hasChanges) {
                    const latest = data.commits[0]
                    setCode(latest.sourceCode)
                    setOriginalCode(latest.sourceCode)
                }
            }
        } catch (error) {
            console.error("Failed to load commits:", error)
        } finally {
            setIsLoadingCommits(false)
        }
    }

    const handleCommit = async (message: string, version: string) => {
        try {
            const res = await fetch('/api/hydra/commit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    packageId: currentPackageId,
                    version,
                    sourceCode: code,
                    message,
                    author: 'addr_test1...' // Mock author
                })
            })

            const data = await res.json()

            if (data.success) {
                toast.success('Committed to Hydra successfully!')
                setOriginalCode(code)
                setIsCommitDialogOpen(false)
                loadCommits() // Refresh history
            } else {
                toast.error(data.error || 'Failed to commit')
            }
        } catch (error) {
            console.error('Commit error:', error)
            toast.error('Failed to commit')
        }
    }

    const handlePushToL1 = async () => {
        // 1. Check for wallet
        if (!window.cardano) {
            toast.error("No Cardano wallet found. Please install Nami or similar.")
            return
        }

        setIsPushing(true)
        try {
            // 2. Connect wallet
            const walletApi = await window.cardano.nami.enable()

            // 3. Get pending commits from backend (and close head)
            toast.loading("Closing Hydra Head and fetching commits...")
            const pushRes = await fetch('/api/hydra/push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageId: currentPackageId })
            })
            const pushData = await pushRes.json()

            if (!pushData.success) {
                throw new Error(pushData.error || "Failed to prepare push")
            }

            if (pushData.commits.length === 0) {
                toast.dismiss()
                toast.info("No pending commits to push")
                setIsPushing(false)
                return
            }

            // 4. Build and Sign L1 Transaction
            toast.dismiss()
            toast.loading(`Signing L1 transaction for ${pushData.commits.length} commits...`)

            const txHash = await batchPublishCommits(pushData.commits, walletApi)

            toast.dismiss()
            toast.success("Transaction submitted to L1!", {
                description: `Tx Hash: ${txHash.slice(0, 10)}...`
            })

            // 5. Poll for confirmation (optional, or just refresh)
            loadCommits()

        } catch (error: any) {
            console.error("Push failed:", error)
            toast.dismiss()
            toast.error("Push to L1 failed", {
                description: error.message
            })
        } finally {
            setIsPushing(false)
        }
    }

    const handleSelectCommit = (commit: HydraCommit) => {
        if (hasChanges) {
            if (!confirm('You have unsaved changes. Are you sure you want to switch versions?')) {
                return
            }
        }
        setCode(commit.sourceCode)
        setOriginalCode(commit.sourceCode)
        toast.info(`Switched to version ${commit.version}`)
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
                <header className="flex items-center justify-between p-6 border-b border-white/10 backdrop-blur-sm bg-white/5 sticky top-0 z-10">
                    <div className="flex-1">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-2xl font-bold text-white"
                        >
                            Version Control
                        </motion.h1>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-center gap-4 mt-1"
                        >
                            <p className="text-slate-400">
                                Edit, commit to Hydra, and push to Cardano
                            </p>
                            <StatusIndicator />
                        </motion.div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={() => setIsCommitDialogOpen(true)}
                            disabled={!hasChanges || isPushing}
                            className="bg-purple-600 hover:bg-purple-700 transition-all hover:scale-105"
                        >
                            <GitCommit className="w-4 h-4 mr-2" />
                            Commit to Hydra
                        </Button>

                        <Button
                            onClick={handlePushToL1}
                            disabled={isPushing}
                            className="bg-green-600 hover:bg-green-700 transition-all hover:scale-105"
                        >
                            {isPushing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4 mr-2" />
                            )}
                            {isPushing ? "Pushing..." : "Push to L1"}
                        </Button>
                    </div>
                </header>

                {/* Main content */}
                <main className="p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-7xl mx-auto space-y-6"
                    >

                        {/* Editor Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <select
                                            value={editorLanguage}
                                            onChange={(e) => setEditorLanguage(e.target.value as any)}
                                            className="bg-slate-800 border-slate-700 text-white rounded px-2 py-1 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                        >
                                            <option value="aiken">Aiken (.ak)</option>
                                            <option value="plutus">Plutus (.hs)</option>
                                            <option value="solidity">Solidity (.sol)</option>
                                        </select>
                                    </div>
                                    <AnimatePresence>
                                        {hasChanges && (
                                            <motion.span
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10 }}
                                                className="text-sm text-slate-400"
                                            >
                                                <span className="text-green-400">+{stats.added}</span> /
                                                <span className="text-red-400 ml-1">-{stats.removed}</span> lines changed
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <motion.div
                                    layout
                                    className="rounded-lg overflow-hidden border border-slate-800 shadow-2xl"
                                >
                                    <CodeEditor
                                        value={code}
                                        onChange={setCode}
                                        language={editorLanguage}
                                        height="600px"
                                    />
                                </motion.div>
                            </div>

                            {/* Sidebar / History / Search */}
                            <div className="space-y-6">
                                {/* Commit History */}
                                <Card className="p-4 bg-black/20 backdrop-blur-sm border-white/10 hover:border-purple-500/30 transition-colors">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-white">Commit History</h3>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={loadCommits}
                                            disabled={isLoadingCommits}
                                            className="h-8 w-8 text-slate-400 hover:text-white"
                                        >
                                            <RefreshCw className={`w-4 h-4 ${isLoadingCommits ? 'animate-spin' : ''}`} />
                                        </Button>
                                    </div>

                                    <CommitHistory
                                        commits={commits}
                                        onSelectCommit={handleSelectCommit}
                                        selectedCommitId={commits.find(c => c.sourceCode === code)?.id}
                                    />
                                </Card>

                                {/* Search Card */}
                                <Card className="p-6 bg-black/20 backdrop-blur-sm border-white/10 hover:border-purple-500/30 transition-colors">
                                    <h3 className="text-lg font-semibold text-white mb-4">Search L1 Versions</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-white mb-2 block">Name</Label>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <Input
                                                    value={searchName}
                                                    onChange={(e) => setSearchName(e.target.value)}
                                                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                                    placeholder="Search..."
                                                    className="pl-10 bg-white/5 border-white/10 text-white focus:border-purple-500"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleSearch}
                                            disabled={isLoading}
                                            className="w-full bg-slate-800 hover:bg-slate-700"
                                        >
                                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </motion.div>
                </main>

                <CommitDialog
                    isOpen={isCommitDialogOpen}
                    onClose={() => setIsCommitDialogOpen(false)}
                    onCommit={handleCommit}
                    stats={stats}
                />
            </div>
        </div>
    )
}
