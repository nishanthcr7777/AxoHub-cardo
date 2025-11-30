"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Stub component - blockchain data fetching removed
// This component will be updated when Cardano integration is added

export function PackagesGrid() {
  return (
    <Card className="p-8 bg-black/20 backdrop-blur-sm border-white/10">
      <div className="text-center space-y-4">
        <div className="text-6xl">📦</div>
        <h3 className="text-xl font-semibold text-white">No Packages Available</h3>
        <p className="text-slate-400">
          Package grid will be available after blockchain integration is complete.
        </p>
        <Badge variant="outline" className="border-purple-500/30 text-purple-300">
          Coming Soon
        </Badge>
      </div>
    </Card>
  )
}
