"use client"

/**
 * ZK Proof Result - Display verification results with animations
 */

import { motion } from "framer-motion"
import { Card } from "./ui/card"
import { Badge } from "./ui/badge"
import { CheckCircle, Shield, Lock, Eye, EyeOff } from "lucide-react"

interface ZKProofResultProps {
    result: {
        success: boolean
        proof?: any
        metadata: {
            nftExists: boolean
            metadataValid: boolean
            packageHashMatches: boolean
            timestamp: number
        }
    }
}

export function ZKProofResult({ result }: ZKProofResultProps) {
    const checks = [
        {
            label: "Valid NFT",
            value: result.metadata.nftExists,
            icon: CheckCircle,
            description: "NFT exists on Cardano blockchain"
        },
        {
            label: "Matches Encrypted Package",
            value: result.metadata.packageHashMatches,
            icon: Shield,
            description: "Package hash matches NFT metadata"
        },
        {
            label: "Private Metadata Verified",
            value: result.metadata.metadataValid,
            icon: Lock,
            description: "Metadata cryptographically verified"
        },
        {
            label: "CID NOT Revealed",
            value: true,
            icon: EyeOff,
            description: "Encrypted CID remains private",
            highlight: true
        }
    ]

    return (
        <div className="space-y-4">
            {/* Success Header */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="p-6 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/30">
                    <div className="flex items-center gap-3">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                        >
                            <CheckCircle className="w-12 h-12 text-green-400" />
                        </motion.div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Proof Verified!</h3>
                            <p className="text-sm text-green-300">
                                Zero-Knowledge proof generated successfully
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Verification Checks */}
            <Card className="p-6 bg-slate-800/50 border-slate-700">
                <h4 className="text-sm font-semibold text-white mb-4">Verification Details</h4>
                <div className="space-y-3">
                    {checks.map((check, index) => (
                        <motion.div
                            key={check.label}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-start gap-3 p-3 rounded-lg ${check.highlight
                                    ? 'bg-purple-900/30 border border-purple-500/30'
                                    : 'bg-slate-700/30'
                                }`}
                        >
                            <check.icon
                                className={`w-5 h-5 mt-0.5 ${check.value ? 'text-green-400' : 'text-red-400'
                                    }`}
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-white">
                                        {check.label}
                                    </span>
                                    {check.value ? (
                                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                            ✓
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                                            ✗
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 mt-1">{check.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Card>

            {/* Privacy Guarantee */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <Card className="p-4 bg-purple-900/20 border-purple-500/30">
                    <div className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-purple-400 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-semibold text-purple-300 mb-2">
                                🌑 Midnight Privacy Guarantee
                            </h4>
                            <ul className="text-xs text-slate-300 space-y-1">
                                <li className="flex items-center gap-2">
                                    <EyeOff className="w-3 h-3" />
                                    Encrypted CID: <strong>NOT REVEALED</strong>
                                </li>
                                <li className="flex items-center gap-2">
                                    <EyeOff className="w-3 h-3" />
                                    Source Code: <strong>NOT ACCESSIBLE</strong>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Lock className="w-3 h-3" />
                                    Private Metadata: <strong>PROTECTED</strong>
                                </li>
                            </ul>
                            <p className="text-xs text-purple-400 mt-3 italic">
                                This proof demonstrates ownership without revealing sensitive data.
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Proof Metadata */}
            <Card className="p-4 bg-slate-800/30 border-slate-700">
                <h4 className="text-xs font-semibold text-slate-400 mb-2">Proof Metadata</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <span className="text-slate-500">Timestamp:</span>
                        <p className="text-slate-300">
                            {new Date(result.metadata.timestamp).toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <span className="text-slate-500">Circuit:</span>
                        <p className="text-slate-300">ownership-proof v1.0</p>
                    </div>
                    <div>
                        <span className="text-slate-500">Protocol:</span>
                        <p className="text-slate-300">Midnight ZK-WASM</p>
                    </div>
                    <div>
                        <span className="text-slate-500">Status:</span>
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                            Verified
                        </Badge>
                    </div>
                </div>
            </Card>
        </div>
    )
}
