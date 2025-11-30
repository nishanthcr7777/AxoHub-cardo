"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Package, Download, CheckCircle, Star } from "lucide-react"

interface StatCardProps {
    title: string
    value: string | number
    icon: React.ReactNode
    delay: number
    trend?: string
}

function StatCard({ title, value, icon, delay, trend }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <Card className="p-6 bg-black/20 backdrop-blur-sm border-white/10 hover:border-purple-500/30 transition-all duration-300">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-slate-400 text-sm font-medium mb-2">{title}</p>
                        <p className="text-3xl font-bold text-white mb-1">{value}</p>
                        {trend && (
                            <p className="text-xs text-green-400 flex items-center gap-1">
                                <span>↗</span> {trend}
                            </p>
                        )}
                    </div>
                    <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                        {icon}
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}

export function DashboardStats() {
    // Placeholder data - will be replaced with real data from Cardano backend
    const stats = [
        {
            title: "Total Packages",
            value: 12,
            icon: <Package className="w-6 h-6" />,
            trend: "+2 this month",
        },
        {
            title: "Total Downloads",
            value: "3.2K",
            icon: <Download className="w-6 h-6" />,
            trend: "+18% from last month",
        },
        {
            title: "Active Packages",
            value: 10,
            icon: <CheckCircle className="w-6 h-6" />,
        },
        {
            title: "Reputation Score",
            value: 847,
            icon: <Star className="w-6 h-6" />,
            trend: "+23 this week",
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <StatCard
                    key={stat.title}
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    delay={index * 0.1}
                    trend={stat.trend}
                />
            ))}
        </div>
    )
}
