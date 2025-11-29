import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Toaster } from "sonner"
import { Providers } from "@/components/providers"
import Script from "next/script"
import "./globals.css"

export const metadata: Metadata = {
  title: "AxoHub - Decentralized Package & Source Registry",
  description: "Publish, discover, and manage smart contract packages and source code",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers>
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: "rgba(0, 0, 0, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "white",
              },
            }}
          />
          <Analytics />
        </Providers>
        <Script src="/js/snarkjs.min.js" strategy="beforeInteractive" />
      </body>
    </html>
  )
}
