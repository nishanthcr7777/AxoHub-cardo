"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { ContractsCards } from "@/components/contracts-cards"
import { PrivateSourcesViewer } from "@/components/private-sources-viewer"
import { SearchFilters } from "@/components/search-filters"
import { FilterProvider } from "@/contexts/filter-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BrowseSourcesPage() {
  const [activeTab, setActiveTab] = useState("public")

  return (
    <FilterProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
        <Sidebar />

        <div className="ml-64 min-h-screen">
          {/* Header */}
          <header className="flex items-center justify-between p-6 border-b border-white/10 backdrop-blur-sm bg-white/5">
            <div className="flex-1">
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
                  : "Unlock private source code with your NFT access key"}
              </motion.p>
            </div>
          </header>

          {/* Main content */}
          <main className="p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-800/50 border border-slate-700">
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
                </TabsList>

                <TabsContent value="public" className="mt-6 space-y-6">
                  <SearchFilters />
                  <ContractsCards />
                </TabsContent>

                <TabsContent value="private" className="mt-6">
                  <PrivateSourcesViewer />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </FilterProvider>
  )
}
