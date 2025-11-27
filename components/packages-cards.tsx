"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { getAllPublished } from "@/lib/cardano/query"
import { RegistryDatum } from "@/lib/cardano/types"
import { ipfsToHttp } from "@/lib/ipfs"
import { useCardanoWallet } from "@/contexts/CardanoWalletContext"

export function PackagesCards() {
  const { address } = useCardanoWallet()
  const [packages, setPackages] = useState<RegistryDatum[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadPackages()
  }, [])

  const loadPackages = async () => {
    try {
      setLoading(true)
      const items = await getAllPublished(address || undefined)
      // Filter only packages
      const packageItems = items.filter((item: RegistryDatum) => item.type === "package")
      setPackages(packageItems)
    } catch (err: any) {
      console.error("Failed to load packages:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-8 bg-black/20 backdrop-blur-sm border-white/10">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-pulse">📦</div>
          <h3 className="text-xl font-semibold text-white">Loading Packages...</h3>
          <p className="text-slate-400">Fetching from Cardano blockchain</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-8 bg-black/20 backdrop-blur-sm border-white/10">
        <div className="text-center space-y-4">
          <div className="text-6xl">⚠️</div>
          <h3 className="text-xl font-semibold text-white">Error Loading Packages</h3>
          <p className="text-slate-400">{error}</p>
          <Button onClick={loadPackages} className="bg-purple-600 hover:bg-purple-700">
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  if (packages.length === 0) {
    return (
      <Card className="p-8 bg-black/20 backdrop-blur-sm border-white/10">
        <div className="text-center space-y-4">
          <div className="text-6xl">📦</div>
          <h3 className="text-xl font-semibold text-white">No Packages Published Yet</h3>
          <p className="text-slate-400">
            Be the first to publish a package to the Cardano registry!
          </p>
          <Button
            onClick={() => window.location.href = '/publish-package'}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Publish Package
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {packages.map((pkg, index) => (
        <motion.div
          key={`${pkg.name}-${pkg.version}-${pkg.timestamp}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-6 bg-black/20 backdrop-blur-sm border-white/10 hover:border-purple-500/50 transition-all duration-300 h-full flex flex-col">
            {/* Package Icon */}
            <div className="text-4xl mb-4">📦</div>

            {/* Package Info */}
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{pkg.name}</h3>
                <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                  v{pkg.version}
                </Badge>
              </div>

              {/* Publisher */}
              <div className="text-sm">
                <span className="text-slate-400">Publisher:</span>
                <code className="text-xs text-slate-300 ml-2 block mt-1">
                  {pkg.publisher.slice(0, 20)}...{pkg.publisher.slice(-10)}
                </code>
              </div>

              {/* Timestamp */}
              <div className="text-sm">
                <span className="text-slate-400">Published:</span>
                <span className="text-slate-300 ml-2">
                  {new Date(pkg.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => window.open(ipfsToHttp(pkg.sourceCID), '_blank')}
                variant="outline"
                className="flex-1 border-white/10 hover:border-purple-500/50 text-white"
                size="sm"
              >
                📄 Source
              </Button>
              <Button
                onClick={() => window.open(ipfsToHttp(pkg.metadataCID), '_blank')}
                variant="outline"
                className="flex-1 border-white/10 hover:border-blue-500/50 text-white"
                size="sm"
              >
                ℹ️ Metadata
              </Button>
            </div>

            {/* Cardano Link */}
            <div className="mt-3">
              <a
                href={`https://preprod.cardanoscan.io/address/${pkg.publisher}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 underline"
              >
                View on Cardano Explorer →
              </a>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
