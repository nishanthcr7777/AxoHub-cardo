"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts"
import { TrendingUp, Download, Package, Eye } from "lucide-react"

type TimeFilter = "7d" | "30d" | "90d" | "all"

export function AnalyticsChart() {
    const [timeFilter, setTimeFilter] = useState<TimeFilter>("30d")

    // Placeholder data - will be replaced with real data from Cardano backend
    const downloadData = [
        { date: "Jan 1", downloads: 120, views: 450, packages: 8 },
        { date: "Jan 5", downloads: 180, views: 520, packages: 9 },
        { date: "Jan 10", downloads: 250, views: 680, packages: 10 },
        { date: "Jan 15", downloads: 320, views: 890, packages: 11 },
        { date: "Jan 20", downloads: 280, views: 750, packages: 11 },
        { date: "Jan 25", downloads: 410, views: 1020, packages: 12 },
        { date: "Today", downloads: 520, views: 1340, packages: 12 },
    ]

    const timeFilters: { value: TimeFilter; label: string }[] = [
        { value: "7d", label: "7 Days" },
        { value: "30d", label: "30 Days" },
        { value: "90d", label: "90 Days" },
        { value: "all", label: "All Time" },
    ]

    const stats = [
        {
            label: "Total Downloads",
            value: "3.2K",
            change: "+18%",
            icon: <Download className="w-4 h-4" />,
            color: "text-purple-400",
        },
        {
            label: "Total Views",
            value: "12.5K",
            change: "+24%",
            icon: <Eye className="w-4 h-4" />,
            color: "text-blue-400",
        },
        {
            label: "Avg. Downloads/Package",
            value: "267",
            change: "+12%",
            icon: <TrendingUp className="w-4 h-4" />,
            color: "text-green-400",
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Analytics</h2>
                    <p className="text-slate-400 text-sm">
                        Track your package performance and engagement
                    </p>
                </div>
                <div className="flex gap-2">
                    {timeFilters.map((filter) => (
                        <Button
                            key={filter.value}
                            onClick={() => setTimeFilter(filter.value)}
                            variant="outline"
                            size="sm"
                            className={
                                timeFilter === filter.value
                                    ? "bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
                                    : "border-white/10 text-slate-300 hover:bg-white/5"
                            }
                        >
                            {filter.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="p-4 bg-black/20 backdrop-blur-sm border-white/10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-slate-400">{stat.label}</span>
                                <span className={stat.color}>{stat.icon}</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <span className="text-2xl font-bold text-white">{stat.value}</span>
                                <span className="text-xs text-green-400">{stat.change}</span>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Downloads Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Card className="p-6 bg-black/20 backdrop-blur-sm border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Download Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={downloadData}>
                            <defs>
                                <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis
                                dataKey="date"
                                stroke="#94a3b8"
                                style={{ fontSize: "12px" }}
                            />
                            <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#0f172a",
                                    border: "1px solid #ffffff20",
                                    borderRadius: "8px",
                                    color: "#fff",
                                }}
                            />
                            <Legend
                                wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="downloads"
                                stroke="#9333ea"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorDownloads)"
                                name="Downloads"
                            />
                            <Area
                                type="monotone"
                                dataKey="views"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorViews)"
                                name="Views"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>
            </motion.div>

            {/* Package Performance */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card className="p-6 bg-black/20 backdrop-blur-sm border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Top Performing Packages
                    </h3>
                    <div className="space-y-4">
                        {[
                            { name: "ada-wallet-connector", downloads: 2156, percentage: 67 },
                            { name: "cardano-utils", downloads: 1247, percentage: 39 },
                            { name: "plutus-helpers", downloads: 892, percentage: 28 },
                            { name: "nft-minter-sdk", downloads: 543, percentage: 17 },
                        ].map((pkg, index) => (
                            <div key={pkg.name} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white font-medium">{pkg.name}</span>
                                    <span className="text-slate-400">
                                        {pkg.downloads.toLocaleString()} downloads
                                    </span>
                                </div>
                                <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pkg.percentage}%` }}
                                        transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
