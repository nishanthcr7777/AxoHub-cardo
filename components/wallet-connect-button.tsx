"use client"

import * as React from "react"
import { useState } from "react"
import { useCardanoWallet } from "@/contexts/CardanoWalletContext"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Wallet, LogOut, Copy, Check, ExternalLink } from "lucide-react"

const WALLET_INFO = {
    nami: {
        name: "Nami",
        icon: "🦎",
        url: "https://namiwallet.io/",
    },
    eternl: {
        name: "Eternl",
        icon: "♾️",
        url: "https://eternl.io/",
    },
    lace: {
        name: "Lace",
        icon: "🎀",
        url: "https://www.lace.io/",
    },
    flint: {
        name: "Flint",
        icon: "🔥",
        url: "https://flint-wallet.com/",
    },
    typhon: {
        name: "Typhon",
        icon: "🌊",
        url: "https://typhonwallet.io/",
    },
    gerowallet: {
        name: "Gero",
        icon: "⚡",
        url: "https://gerowallet.io/",
    },
}

export function WalletConnectButton() {
    const {
        isConnected,
        isConnecting,
        address,
        balance,
        walletName,
        network,
        connectWallet,
        disconnectWallet,
        availableWallets,
        lucid,
        initializationError,
    } = useCardanoWallet()

    const [open, setOpen] = useState(false)
    const [copied, setCopied] = useState(false)
    const [connecting, setConnecting] = useState<string | null>(null)

    const handleConnect = async (wallet: keyof typeof WALLET_INFO) => {
        setConnecting(wallet)
        try {
            await connectWallet(wallet)
            setOpen(false)
        } catch (error) {
            console.error("Connection error:", error)
            alert(`Failed to connect to ${WALLET_INFO[wallet].name}. Please make sure the wallet extension is installed.`)
        } finally {
            setConnecting(null)
        }
    }

    const handleCopyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const truncateAddress = (addr: string) => {
        return `${addr.slice(0, 12)}...${addr.slice(-8)}`
    }

    if (isConnected && address) {
        return (
            <div className="flex items-center gap-3">
                <Badge
                    variant="outline"
                    className={
                        network === "Preprod"
                            ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
                            : "bg-green-500/10 text-green-400 border-green-500/30"
                    }
                >
                    {network}
                </Badge>

                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
                    <div className="text-2xl">{walletName && WALLET_INFO[walletName]?.icon}</div>
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400">Balance</span>
                        <span className="text-sm font-semibold text-white">{balance} ₳</span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAddress}
                    className="border-white/10 text-slate-300 hover:bg-white/5"
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4 mr-2" />
                            Copied
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4 mr-2" />
                            {truncateAddress(address)}
                        </>
                    )}
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectWallet}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect
                </Button>
            </div>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Connect Cardano Wallet</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Choose a wallet to connect to AxoHub
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 mt-4">
                    {availableWallets.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-slate-400 mb-4">No Cardano wallets detected</p>
                            <p className="text-sm text-slate-500 mb-4">
                                Please install a Cardano wallet extension to continue
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(WALLET_INFO).map(([key, info]) => (
                                    <a
                                        key={key}
                                        href={info.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                                    >
                                        <span className="text-2xl">{info.icon}</span>
                                        <span className="text-sm">{info.name}</span>
                                        <ExternalLink className="w-3 h-3 ml-auto text-slate-400" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    ) : (
                        availableWallets.map((wallet) => {
                            const info = WALLET_INFO[wallet]
                            const isConnecting = connecting === wallet

                            return (
                                <button
                                    key={wallet}
                                    onClick={() => handleConnect(wallet)}
                                    disabled={isConnecting || !lucid}
                                    className="w-full flex items-center gap-4 p-4 rounded-lg border border-white/10 hover:bg-white/5 hover:border-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="text-3xl">{info.icon}</span>
                                    <div className="flex-1 text-left">
                                        <p className="font-semibold text-white">{info.name}</p>
                                        <p className="text-xs text-slate-400">
                                            {isConnecting ? "Connecting..." :
                                                initializationError ? "Connection Error" :
                                                    !lucid ? "Initializing..." : "Click to connect"}
                                        </p>
                                        {initializationError && (
                                            <p className="text-[10px] text-red-400 mt-1 truncate max-w-[200px]" title={initializationError}>
                                                {initializationError}
                                            </p>
                                        )}
                                    </div>
                                    {isConnecting && (
                                        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                    )}
                                </button>
                            )
                        })
                    )}
                </div>

                <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <p className="text-xs text-blue-300">
                        💡 <strong>Tip:</strong> Make sure you're on the{" "}
                        <span className="font-semibold">{network}</span> network in your wallet
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
