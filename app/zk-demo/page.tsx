"use client"

/**
 * Midnight ZK Proof Demo Page
 * Showcases Zero-Knowledge proof of NFT ownership
 */

import { useState } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ZKVerifyButton } from "@/components/zk-verify-button"
import { Shield, Lock, Eye, EyeOff, Zap, CheckCircle } from "lucide-react"

export default function ZKDemoPage() {
    const [proofResult, setProofResult] = useState<any>(null)

    const demoScenarios = [
        {
            title: "Developer Publishes Private Package",
            steps: [
                "Developer submits package with encryption",
                "Package uploaded to IPFS (encrypted)",
                "NFT minted with encrypted CID in metadata",
                "Developer receives NFT as access key"
            ],
            icon: Lock
        },
        {
            title: "Auditor Verifies Access",
            steps: [
                "Auditor enters NFT token ID",
                "Clicks 'ZK Verify Access Key (Midnight)'",
                "System generates ZK proof without revealing CID",
                "Auditor sees verification ✅ but CID stays private"
            ],
            icon: Shield
        },
        {
            title: "Investor Gets Proof of Existence",
            steps: [
                "Investor wants to verify package exists",
                "Uses ZK proof (doesn't need to see code)",
                "Proof shows package is real and NFT is valid",
                "Content stays completely private"
            ],
            icon: Eye
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-black">
            <Sidebar />

            <div className="ml-64 min-h-screen">
                {/* Header */}
                <header className="flex items-center justify-between p-6 border-b border-white/10 backdrop-blur-sm bg-white/5">
                    <div className="flex-1">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-3xl font-bold text-white flex items-center gap-3"
                        >
                            <span>🌑</span>
                            Midnight ZK Proof Demo
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-slate-400 mt-1"
                        >
                            Zero-Knowledge proof of NFT ownership without revealing encrypted CID
                        </motion.p>
                    </div>
                </header>

                {/* Main content */}
                <main className="p-8">
                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* Hero Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="p-8 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border-purple-500/30">
                                <div className="flex items-start gap-6">
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-white mb-3">
                                            Privacy-Preserving Package Verification
                                        </h2>
                                        <p className="text-slate-300 mb-6">
                                            Prove you own an NFT and have access to a private package without revealing the encrypted IPFS CID or source code.
                                            This uses <strong>Midnight's Compact Language</strong> for real Zero-Knowledge proofs.
                                        </p>

                                        <div className="flex flex-wrap gap-3 mb-6">
                                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                                ✓ Proves Ownership
                                            </Badge>
                                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                                ✓ Verifies Package Exists
                                            </Badge>
                                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                                ✗ CID NOT Revealed
                                            </Badge>
                                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                                ✗ Code NOT Exposed
                                            </Badge>
                                        </div>

                                        <ZKVerifyButton
                                            onProofGenerated={setProofResult}
                                            className="w-full sm:w-auto"
                                        />
                                    </div>

                                    <div className="hidden lg:block">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        >
                                            <Shield className="w-24 h-24 text-purple-400/30" />
                                        </motion.div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Demo Scenarios */}
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4">Use Case Scenarios</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                {demoScenarios.map((scenario, index) => (
                                    <motion.div
                                        key={scenario.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Card className="p-6 bg-black/20 backdrop-blur-sm border-white/10 hover:border-purple-500/30 transition-all h-full">
                                            <scenario.icon className="w-8 h-8 text-purple-400 mb-3" />
                                            <h4 className="text-lg font-semibold text-white mb-3">
                                                {scenario.title}
                                            </h4>
                                            <ol className="space-y-2">
                                                {scenario.steps.map((step, i) => (
                                                    <li key={i} className="text-sm text-slate-300 flex gap-2">
                                                        <span className="text-purple-400">{i + 1}.</span>
                                                        <span>{step}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* How It Works */}
                        <Card className="p-6 bg-black/20 backdrop-blur-sm border-white/10">
                            <h3 className="text-xl font-bold text-white mb-4">How Midnight ZK Works</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                                        <Zap className="w-4 h-4" />
                                        ZK Circuit Logic
                                    </h4>
                                    <div className="bg-slate-800/50 p-4 rounded-lg font-mono text-xs text-slate-300">
                                        <div>Inputs (Private):</div>
                                        <div className="ml-4">- nftId</div>
                                        <div className="ml-4">- encryptedCidHash</div>
                                        <div className="mt-2">Output (Public):</div>
                                        <div className="ml-4">- isValid (1/0)</div>
                                        <div className="mt-2">Constraint:</div>
                                        <div className="ml-4 text-purple-300">
                                            SHA256(nftId) == encryptedCidHash
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Privacy Guarantees
                                    </h4>
                                    <ul className="space-y-2 text-sm text-slate-300">
                                        <li className="flex items-start gap-2">
                                            <EyeOff className="w-4 h-4 mt-0.5 text-purple-400" />
                                            <span>NFT ID never revealed in proof</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <EyeOff className="w-4 h-4 mt-0.5 text-purple-400" />
                                            <span>Encrypted CID hash stays private</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Lock className="w-4 h-4 mt-0.5 text-purple-400" />
                                            <span>Source code remains encrypted</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 mt-0.5 text-green-400" />
                                            <span>Only proves: "I own this NFT and it's valid"</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </Card>

                        {/* Technical Stack */}
                        <Card className="p-6 bg-black/20 backdrop-blur-sm border-white/10">
                            <h3 className="text-xl font-bold text-white mb-4">Technical Stack</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { name: "Midnight ZK-WASM", desc: "Client-side proving" },
                                    { name: "Midnight Compact", desc: "Native ZK Contract" },
                                    { name: "Cardano NFTs", desc: "Access control" },
                                    { name: "IPFS Encryption", desc: "Content privacy" }
                                ].map((tech) => (
                                    <div key={tech.name} className="text-center">
                                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                                            <p className="text-sm font-semibold text-white">{tech.name}</p>
                                            <p className="text-xs text-slate-400 mt-1">{tech.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    )
}
