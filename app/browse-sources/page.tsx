"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { ContractsCards } from "@/components/contracts-cards"
import { PrivateSourcesViewer } from "@/components/private-sources-viewer"
import { SearchFilters } from "@/components/search-filters"
import { FilterProvider } from "@/contexts/filter-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ZKVerifyButton } from "@/components/zk-verify-button"
import { Card } from "@/components/ui/card"
import { Shield } from "lucide-react"
import { Header } from "@/components/header"

export default function BrowseSourcesPage() {
  const [activeTab, setActiveTab] = useState("public")

  return (
    <FilterProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
        <Sidebar />

        <div className="ml-64 min-h-screen">
          {/* Header */}
          <Header>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-white"
            >
              Browse Sources
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 mt-1"
            >
              {activeTab === "public"
                ? "Explore published smart contracts on Cardano"
                : activeTab === "private"
                  ? "Unlock private source code with your NFT access key"
                  : "Verify ownership with Zero-Knowledge proofs"}
            </motion.p>
          </Header>

          {/* Main content */}
          <main className="p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-xl grid-cols-3 bg-slate-800/50 border border-slate-700">
                  <TabsTrigger
                    value="public"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600"
                  >
                    🌐 Public Sources
                  </TabsTrigger>
                  <TabsTrigger
                    value="private"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600"
                  >
                    🔒 Private Sources
                  </TabsTrigger>
                  <TabsTrigger
                    value="zk-proof"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600"
                  >
                    🌑 View ZK Proof
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="public" className="mt-6 space-y-6">
                  <SearchFilters />
                  <ContractsCards />
                </TabsContent>

                <TabsContent value="private" className="mt-6">
                  <PrivateSourcesViewer />
                </TabsContent>

                <TabsContent value="zk-proof" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="p-12 bg-gradient-to-br from-slate-900 to-purple-900/20 border-purple-500/30">
                      <div className="flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
                        <div className="p-4 bg-purple-500/10 rounded-full border border-purple-500/20">
                          <Shield className="w-16 h-16 text-purple-400" />
                        </div>

                        <div className="space-y-2">
                          <h2 className="text-3xl font-bold text-white">
                            Verify Ownership via ZK Proof
                          </h2>
                          <p className="text-slate-400 text-lg">
                            Use <strong className="text-purple-300">ZK Proofs</strong> to verify NFT ownership and package access rights without revealing sensitive data or encrypted CIDs.
                          </p>
                        </div>

                        <div className="w-full max-w-md pt-4">
                          <ZKVerifyButton className="w-full text-lg py-6" />
                        </div>

                        <div className="grid grid-cols-3 gap-4 w-full pt-8 text-sm text-slate-500">
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-purple-400">🔒</span>
                            <span>Private Witness</span>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-purple-400">🛡️</span>
                            <span>Selective Disclosure</span>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-purple-400">⚡</span>
                            <span>Compact Runtime</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </FilterProvider>
  )
}
