"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, CheckCircle2, Wifi, WifiOff, RefreshCw } from "lucide-react"
import { hydraClient } from "@/lib/hydra/client"

export function StatusIndicator() {
    const [isConnected, setIsConnected] = useState(false)
    const [headStatus, setHeadStatus] = useState<'idle' | 'open' | 'closed'>('idle')
    const [lastPing, setLastPing] = useState<number>(Date.now())

    useEffect(() => {
        // Poll for status (simulated real-time)
        const interval = setInterval(async () => {
            try {
                // In a real app, we'd check hydraClient.ws.readyState
                // For now, we assume connected if we can get commits
                setIsConnected(true)
                setLastPing(Date.now())

                // Mock head status logic
                // If we have pending commits, head is likely open
                setHeadStatus('open')
            } catch (e) {
                setIsConnected(false)
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex items-center gap-4 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-full px-4 py-2">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.8, 1]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    {isConnected ? (
                        <Wifi className="w-4 h-4 text-green-500" />
                    ) : (
                        <WifiOff className="w-4 h-4 text-red-500" />
                    )}
                </motion.div>
                <span className="text-xs font-medium text-slate-300">
                    {isConnected ? "Hydra Connected" : "Disconnected"}
                </span>
            </div>

            <div className="h-4 w-px bg-slate-700" />

            {/* Head Status */}
            <div className="flex items-center gap-2">
                <Activity className={`w-4 h-4 ${headStatus === 'open' ? 'text-purple-500' : 'text-slate-500'}`} />
                <span className="text-xs font-medium text-slate-300">
                    Head: <span className={headStatus === 'open' ? 'text-purple-400' : 'text-slate-400'}>
                        {headStatus.toUpperCase()}
                    </span>
                </span>
            </div>
        </div>
    )
}
