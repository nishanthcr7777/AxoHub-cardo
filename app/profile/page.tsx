"use client"

import * as React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardStats } from "@/components/dashboard-stats"
import { PublishedPackagesSection } from "@/components/published-packages-section"
import { DidManagementSection } from "@/components/did-management-section"
import { ApiKeysSection } from "@/components/api-keys-section"
import { AnalyticsChart } from "@/components/analytics-chart"
import { Package, Upload, LayoutDashboard, BarChart3, Settings } from "lucide-react"

export default function DevelopersDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      <Sidebar />

      <div className="ml-64 min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-white/10 backdrop-blur-sm bg-white/5 sticky top-0 z-10">
          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-white"
            >
              Developers Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 mt-1"
            >
              Manage your packages, analytics, and developer identity
            </motion.p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-white/10 text-slate-300 hover:bg-white/5"
            >
              <Upload className="w-4 h-4 mr-2" />
              Submit Source
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Package className="w-4 h-4 mr-2" />
              Publish Package
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="overview" className="space-y-8">
              <TabsList className="bg-black/20 border border-white/10 p-1">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="packages"
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Packages
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-8">
                <DashboardStats />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Recent Packages</h3>
                    <PublishedPackagesSection />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Performance</h3>
                    <AnalyticsChart />
                  </div>
                </div>
              </TabsContent>

              {/* Packages Tab */}
              <TabsContent value="packages" className="space-y-8">
                <PublishedPackagesSection />
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-8">
                <DashboardStats />
                <AnalyticsChart />
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-8">
                <DidManagementSection />
                <ApiKeysSection />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
