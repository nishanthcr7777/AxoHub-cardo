"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Fingerprint, Copy, CheckCircle, ExternalLink, Shield } from "lucide-react"
import { useState } from "react"

export function DidManagementSection() {
    const [copied, setCopied] = useState(false)

    // Placeholder DID - will be replaced with real DID from Cardano backend
    const did = "did:cardano:mainnet:addr1qx2kd28nq8ac5prwg32hhvudlwggpgfp8utlyqxu6wqgz62f79qsdmm5dsknt9ecr5w468r9ey0fxwkdrwh08ly3tu9sy0f4qd"
    const isVerified = true

    const handleCopyDID = () => {
        navigator.clipboard.writeText(did)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-1">Decentralized Identity (DID)</h2>
                <p className="text-slate-400 text-sm">
                    Manage your Cardano-based decentralized identity
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* DID Display Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="p-6 bg-black/20 backdrop-blur-sm border-white/10">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                                <Fingerprint className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-semibold text-white">Your DID</h3>
                                    {isVerified && (
                                        <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Verified
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400">
                                    Cardano Mainnet Identity
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 rounded-lg p-4 mb-4 border border-white/5">
                            <p className="text-sm text-slate-300 font-mono break-all">
                                {did}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleCopyDID}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copy DID
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                className="border-white/10 text-slate-300 hover:bg-white/5"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        </div>
                    </Card>
                </motion.div>

                {/* DID Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="p-6 bg-black/20 backdrop-blur-sm border-white/10">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-1">DID Benefits</h3>
                                <p className="text-xs text-slate-400">
                                    Why decentralized identity matters
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2" />
                                <div>
                                    <p className="text-sm text-white font-medium">Self-Sovereign Identity</p>
                                    <p className="text-xs text-slate-400">You own and control your identity</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2" />
                                <div>
                                    <p className="text-sm text-white font-medium">Verifiable Credentials</p>
                                    <p className="text-xs text-slate-400">Cryptographically secure attestations</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2" />
                                <div>
                                    <p className="text-sm text-white font-medium">Cross-Platform</p>
                                    <p className="text-xs text-slate-400">Use your DID across the Cardano ecosystem</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2" />
                                <div>
                                    <p className="text-sm text-white font-medium">Privacy-Preserving</p>
                                    <p className="text-xs text-slate-400">Share only what you choose to reveal</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* DID Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Card className="p-6 bg-black/20 backdrop-blur-sm border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">DID Management</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                            variant="outline"
                            className="border-white/10 text-slate-300 hover:bg-white/5 justify-start"
                        >
                            <Fingerprint className="w-4 h-4 mr-2" />
                            Update DID Document
                        </Button>
                        <Button
                            variant="outline"
                            className="border-white/10 text-slate-300 hover:bg-white/5 justify-start"
                        >
                            <Shield className="w-4 h-4 mr-2" />
                            Manage Credentials
                        </Button>
                        <Button
                            variant="outline"
                            className="border-white/10 text-slate-300 hover:bg-white/5 justify-start"
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View on Explorer
                        </Button>
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
