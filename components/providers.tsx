"use client"

import * as React from "react"
import { CardanoWalletProvider } from "@/contexts/CardanoWalletContext"

export function Providers({ children }: { children: React.ReactNode }) {
    return <CardanoWalletProvider>{children}</CardanoWalletProvider>
}
