"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Download, Eye, Edit, Trash2, ExternalLink } from "lucide-react"

interface PackageCardProps {
    name: string
    version: string
    description: string
    downloads: number
    status: "active" | "deprecated" | "pending"
    lastUpdated: string
    delay: number
}

function PackageCard({
    name,
    version,
    description,
    downloads,
    status,
    lastUpdated,
    delay,
}: PackageCardProps) {
    const statusColors = {
        active: "bg-green-500/10 text-green-400 border-green-500/30",
        deprecated: "bg-orange-500/10 text-orange-400 border-orange-500/30",
        pending: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <Card className="p-6 bg-black/20 backdrop-blur-sm border-white/10 hover:border-purple-500/30 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                            <Package className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold text-white">{name}</h3>
                                <Badge className="text-xs">{version}</Badge>
                            </div>
                            <p className="text-sm text-slate-400 line-clamp-2">{description}</p>
                        </div>
                    </div>
                    <Badge className={statusColors[status]}>{status}</Badge>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            <span>{downloads.toLocaleString()}</span>
                        </div>
                        <div className="text-xs">Updated {lastUpdated}</div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-white hover:bg-white/5"
                        >
                            <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-white hover:bg-white/5"
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-red-400 hover:bg-red-500/5"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}

export function PublishedPackagesSection() {
    // Placeholder data - will be replaced with real data from Cardano backend
    const packages = [
        {
            name: "cardano-utils",
            version: "v2.1.0",
            description: "Essential utilities for Cardano blockchain development and smart contract interaction",
            downloads: 1247,
            status: "active" as const,
            lastUpdated: "2 days ago",
        },
        {
            name: "plutus-helpers",
            version: "v1.5.3",
            description: "Helper functions and validators for Plutus smart contract development",
            downloads: 892,
            status: "active" as const,
            lastUpdated: "1 week ago",
        },
        {
            name: "ada-wallet-connector",
            version: "v3.0.1",
            description: "Seamless wallet connection library for Cardano dApps with multi-wallet support",
            downloads: 2156,
            status: "active" as const,
            lastUpdated: "3 days ago",
        },
        {
            name: "nft-minter-sdk",
            version: "v1.2.0",
            description: "SDK for minting and managing NFTs on Cardano blockchain",
            downloads: 543,
            status: "deprecated" as const,
            lastUpdated: "2 months ago",
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Published Packages</h2>
                    <p className="text-slate-400 text-sm">
                        Manage and monitor your published packages
                    </p>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Package className="w-4 h-4 mr-2" />
                    Publish New Package
                </Button>
            </div>

            {packages.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {packages.map((pkg, index) => (
                        <PackageCard key={pkg.name} {...pkg} delay={index * 0.1} />
                    ))}
                </div>
            ) : (
                <Card className="p-12 bg-black/20 backdrop-blur-sm border-white/10 text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Packages Yet</h3>
                    <p className="text-slate-400 mb-6">
                        Start contributing to the Cardano ecosystem by publishing your first package
                    </p>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                        <Package className="w-4 h-4 mr-2" />
                        Publish Your First Package
                    </Button>
                </Card>
            )}
        </div>
    )
}
