"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Key, Copy, Trash2, Plus, Eye, EyeOff, AlertTriangle } from "lucide-react"
import { useState } from "react"

interface ApiKey {
    id: string
    name: string
    key: string
    createdAt: string
    lastUsed: string | null
    status: "active" | "revoked"
}

function ApiKeyCard({ apiKey, onRevoke, onCopy }: {
    apiKey: ApiKey
    onRevoke: (id: string) => void
    onCopy: (key: string) => void
}) {
    const [showKey, setShowKey] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        onCopy(apiKey.key)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const maskedKey = `${apiKey.key.slice(0, 8)}${"•".repeat(32)}${apiKey.key.slice(-8)}`

    return (
        <Card className="p-4 bg-black/20 backdrop-blur-sm border-white/10">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                        <Key className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white mb-1">{apiKey.name}</h4>
                        <p className="text-xs text-slate-400">
                            Created {apiKey.createdAt}
                            {apiKey.lastUsed && ` • Last used ${apiKey.lastUsed}`}
                        </p>
                    </div>
                </div>
                <Badge
                    className={
                        apiKey.status === "active"
                            ? "bg-green-500/10 text-green-400 border-green-500/30"
                            : "bg-red-500/10 text-red-400 border-red-500/30"
                    }
                >
                    {apiKey.status}
                </Badge>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-3 mb-3 border border-white/5">
                <div className="flex items-center gap-2">
                    <code className="text-xs text-slate-300 font-mono flex-1 break-all">
                        {showKey ? apiKey.key : maskedKey}
                    </code>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowKey(!showKey)}
                        className="text-slate-400 hover:text-white hover:bg-white/5 h-6 w-6 p-0"
                    >
                        {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    onClick={handleCopy}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-white/10 text-slate-300 hover:bg-white/5 text-xs"
                >
                    {copied ? (
                        <>
                            <Copy className="w-3 h-3 mr-1" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                        </>
                    )}
                </Button>
                {apiKey.status === "active" && (
                    <Button
                        onClick={() => onRevoke(apiKey.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                    >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Revoke
                    </Button>
                )}
            </div>
        </Card>
    )
}

export function ApiKeysSection() {
    // Placeholder data - will be replaced with real data from Cardano backend
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([
        {
            id: "1",
            name: "Production API Key",
            key: "axh_prod_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
            createdAt: "Jan 15, 2025",
            lastUsed: "2 hours ago",
            status: "active",
        },
        {
            id: "2",
            name: "Development API Key",
            key: "axh_dev_z6y5x4w3v2u1t0s9r8q7p6o5n4m3l2k1j0i9h8g7f6e5d4c3b2a1",
            createdAt: "Dec 10, 2024",
            lastUsed: "1 day ago",
            status: "active",
        },
        {
            id: "3",
            name: "Testing API Key (Revoked)",
            key: "axh_test_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z",
            createdAt: "Nov 5, 2024",
            lastUsed: null,
            status: "revoked",
        },
    ])

    const handleRevoke = (id: string) => {
        setApiKeys((keys) =>
            keys.map((key) => (key.id === id ? { ...key, status: "revoked" as const } : key))
        )
    }

    const handleCopy = (key: string) => {
        navigator.clipboard.writeText(key)
    }

    const handleCreateKey = () => {
        // Placeholder for create key functionality
        console.log("Create new API key")
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">API Keys</h2>
                    <p className="text-slate-400 text-sm">
                        Manage your API keys for programmatic access
                    </p>
                </div>
                <Button
                    onClick={handleCreateKey}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Key
                </Button>
            </div>

            {/* Security Notice */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="p-4 bg-orange-500/5 backdrop-blur-sm border-orange-500/20">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-semibold text-orange-300 mb-1">
                                Security Best Practices
                            </h4>
                            <ul className="text-xs text-orange-200/80 space-y-1">
                                <li>• Never share your API keys publicly or commit them to version control</li>
                                <li>• Rotate your keys regularly and revoke unused keys</li>
                                <li>• Use different keys for different environments (dev, staging, prod)</li>
                                <li>• Monitor your API key usage for suspicious activity</li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* API Keys List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {apiKeys.map((apiKey, index) => (
                    <motion.div
                        key={apiKey.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                    >
                        <ApiKeyCard
                            apiKey={apiKey}
                            onRevoke={handleRevoke}
                            onCopy={handleCopy}
                        />
                    </motion.div>
                ))}
            </div>

            {apiKeys.length === 0 && (
                <Card className="p-12 bg-black/20 backdrop-blur-sm border-white/10 text-center">
                    <div className="text-6xl mb-4">🔑</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No API Keys Yet</h3>
                    <p className="text-slate-400 mb-6">
                        Create your first API key to start accessing AxoHub programmatically
                    </p>
                    <Button
                        onClick={handleCreateKey}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Key
                    </Button>
                </Card>
            )}
        </div>
    )
}
