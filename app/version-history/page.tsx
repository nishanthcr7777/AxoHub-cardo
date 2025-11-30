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
import { Search, Loader2, GitCommit, Send, RefreshCw, Edit, Play, Square } from "lucide-react"
import { toast } from "sonner"
import { CodeEditor } from "@/components/code-editor"
import { CommitDialog } from "@/components/commit-dialog"
import { CommitHistory } from "@/components/commit-history"
// import { StatusIndicator } from "@/components/status-indicator"
import { generateDiff, calculateStats } from "@/lib/hydra/diff"
import { batchPublishCommits } from "@/lib/cardano/batch-publish"
import { HydraCommit } from "@/lib/cardano/types"
import { hydraClient } from "@/lib/hydra/client"

import { useCardanoWallet } from "@/contexts/CardanoWalletContext"

export default function VersionHistoryPage() {
    const { lucid, isConnected } = useCardanoWallet()
    const [isEditing, setIsEditing] = useState(false)
    const [hydraStatus, setHydraStatus] = useState<"idle" | "opening" | "initializing" | "open" | "closing" | "closed">("idle")

    // Editor State
    const [code, setCode] = useState("// Loading source code...")
    const [originalCode, setOriginalCode] = useState("// Loading source code...")
    const [stats, setStats] = useState({ added: 0, removed: 0 })
    const [hasChanges, setHasChanges] = useState(false)
    const [editorLanguage, setEditorLanguage] = useState<"plutus" | "aiken" | "solidity">("aiken")

    // Commit State
    const [isCommitDialogOpen, setIsCommitDialogOpen] = useState(false)
    const [commits, setCommits] = useState<HydraCommit[]>([])

    // Mock initial load
    useEffect(() => {
        // Simulate loading source code from L1 or IPFS
        setTimeout(() => {
            const initialSource = `validator gift_card {
  spend(datum: Option<Data>, redeemer: Data, ctx: ScriptContext) {
    expect Some(_datum) = datum
    true
  }
}`
            setCode(initialSource)
            setOriginalCode(initialSource)
        }, 1000)
    }, [])

    useEffect(() => {
        if (code !== originalCode) {
            const diff = generateDiff(originalCode, code)
            setStats(calculateStats(diff))
            setHasChanges(true)
        } else {
            setHasChanges(false)
        }
    }, [code, originalCode])


    const handleStartEditing = async () => {
        setHydraStatus("opening")
        toast.loading("Initializing Hydra Head...")

        try {
            // Real Hydra Head initialization
            const { status } = await hydraClient.openHead()

            if (status === 'Initializing') {
                setHydraStatus("initializing")
                toast.dismiss()
                toast.info("Head Initialized. Please Commit (Deposit) to Open.")
            } else {
                setHydraStatus("open")
                setIsEditing(true)
                toast.dismiss()
                toast.success("Hydra Head Open! You can now edit and commit.")
            }
        } catch (error) {
            console.error("Failed to open Hydra Head:", error)
            setHydraStatus("idle")
            toast.dismiss()
            toast.error("Failed to open Hydra Head. Check console.")
        }
    }

    const handleCommit = () => {
        setIsCommitDialogOpen(true)
    }

    const handleConfirmCommit = async (message: string, version: string) => {
        try {
            const newCommit: HydraCommit = {
                id: Math.random().toString(36).substr(2, 9),
                packageId: "pkg_demo_123",
                version: version,
                message: message,
                sourceCode: code,
                sourceCID: "", // In real app, upload to IPFS first
                metadataCID: "",
                author: "addr_test1...",
                timestamp: Date.now(),
                status: "hydra_pending",
                commitHash: "hash_" + Math.random().toString(36).substr(2, 9),
                linesAdded: stats.added,
                linesRemoved: stats.removed
            }

            // Send to Hydra
            if (!lucid || !isConnected) {
                toast.error("Wallet not connected. Please connect wallet to sign commit.")
                return
            }

            if (hydraStatus === "open") {
                // Head is open, send L2 transaction
                await hydraClient.sendL2Transaction(newCommit, lucid)
                toast.success("Committed to Hydra successfully!")
            } else if (hydraStatus === "initializing") {
                // Head is initializing, we need to Deposit (Commit) a UTXO
                // Fetch UTXOs
                const utxos = await lucid.wallet.getUtxos()
                if (utxos.length === 0) {
                    toast.error("No UTXOs found in wallet to commit.")
                    return
                }
                // Select the first UTXO for now (simplification)
                const selectedUtxo = utxos[0]
                await hydraClient.commit(selectedUtxo)
                toast.success("Deposit committed to Hydra! Waiting for Head to open...")

                // Optimistically set to open or wait for event?
                setHydraStatus("open")
            } else {
                toast.error("Head is not ready. Please Start Editing first.")
                return
            }

            setCommits([newCommit, ...commits])
            setOriginalCode(code) // Update baseline
            setIsCommitDialogOpen(false)

        } catch (error) {
            console.error("Commit error:", error)
            toast.error("Failed to commit to Hydra")
        }
    }

    const handlePushToL1 = async () => {
        setHydraStatus("closing")
        toast.loading("Closing Hydra Head and Pushing to L1...")

        try {
            // Close Hydra Head and settle on L1
            await hydraClient.closeAndSettle()

            // Mark commits as pushed
            setCommits(commits.map(c => ({ ...c, status: "pushed_to_l1" })))

            setHydraStatus("idle")
            setIsEditing(false)
            toast.dismiss()
            toast.success("Successfully pushed to Cardano L1!")
        } catch (error) {
            console.error("Push failed:", error)
            setHydraStatus("open") // Revert status
            toast.dismiss()
            toast.error("Failed to push to L1")
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
            <Sidebar />

            <div className="ml-64 min-h-screen">
                {/* Header */}
                <header className="flex items-center justify-between p-6 border-b border-white/10 backdrop-blur-sm bg-white/5 sticky top-0 z-10">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white">
                            Version Control
                        </h1>
                        <div className="flex items-center gap-4 mt-1">
                            <p className="text-slate-400">
                                {hydraStatus === "open"
                                    ? "Hydra Head Active - Edits are local"
                                    : "View Mode - Start editing to open Hydra Head"}
                            </p>
                            {/* <StatusIndicator /> */}
                            <Badge variant={hydraStatus === "open" ? "default" : "secondary"} className={hydraStatus === "open" ? "bg-purple-500" : "bg-slate-700"}>
                                Status: {hydraStatus.toUpperCase()}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {!isEditing ? (
                            <Button
                                onClick={handleStartEditing}
                                disabled={hydraStatus === "opening"}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {hydraStatus === "opening" ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Edit className="w-4 h-4 mr-2" />
                                )}
                                {hydraStatus === "opening" ? "Opening Head..." : "Start Editing"}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={handleCommit}
                                    disabled={!hasChanges}
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    <GitCommit className="w-4 h-4 mr-2" />
                                    Commit to Hydra
                                </Button>

                                <Button
                                    onClick={handlePushToL1}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Push to L1
                                </Button>
                            </>
                        )}
                    </div>
                </header>

                {/* Main content */}
                <main className="p-8">
                    <div className="max-w-7xl mx-auto space-y-6">

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

                                <div className="rounded-lg overflow-hidden border border-slate-800 shadow-2xl">
                                    <CodeEditor
                                        value={code}
                                        onChange={isEditing ? setCode : () => { }} // Read-only if not editing
                                        language={editorLanguage}
                                    />
                                </div>
                            </div>

                            {/* Sidebar / History / Search */}
                            <div className="space-y-6">
                                {/* Commit History */}
                                <Card className="p-4 bg-black/20 backdrop-blur-sm border-white/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-white">Commit History</h3>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                            <RefreshCw className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <CommitHistory
                                        commits={commits}
                                        onSelectCommit={handleSelectCommit}
                                        selectedCommitId={commits.find(c => c.sourceCode === code)?.id}
                                    />
                                </Card>
                            </div>
                        </div>
                    </div>
                </main>

                <CommitDialog
                    isOpen={isCommitDialogOpen}
                    onClose={() => setIsCommitDialogOpen(false)}
                    onCommit={handleConfirmCommit}
                    stats={stats}
                />
            </div>
        </div>
    )
}
