"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type CardanoNetwork = "Preprod" | "Mainnet"
type WalletName = "nami" | "eternl" | "lace" | "flint" | "typhon" | "gerowallet"

interface CardanoWalletContextType {
    walletName: WalletName | null
    walletApi: any | null
    address: string | null
    balance: string | null
    network: CardanoNetwork
    isConnected: boolean
    isConnecting: boolean
    lucid: any | null
    connectWallet: (walletName: WalletName) => Promise<void>
    disconnectWallet: () => void
    switchNetwork: (network: CardanoNetwork) => Promise<void>
    availableWallets: WalletName[]
    initializationError: string | null
}

const CardanoWalletContext = createContext<CardanoWalletContextType | undefined>(undefined)

export function CardanoWalletProvider({ children }: { children: React.ReactNode }) {
    const [walletName, setWalletName] = useState<WalletName | null>(null)
    const [walletApi, setWalletApi] = useState<any | null>(null)
    const [address, setAddress] = useState<string | null>(null)
    const [balance, setBalance] = useState<string | null>(null)
    const [network, setNetwork] = useState<CardanoNetwork>("Preprod")
    const [isConnected, setIsConnected] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)
    const [lucid, setLucid] = useState<any | null>(null)
    const [availableWallets, setAvailableWallets] = useState<WalletName[]>([])
    const [lucidLoaded, setLucidLoaded] = useState(false)
    const [initializationError, setInitializationError] = useState<string | null>(null)

    // Dynamically import Lucid only on client side
    useEffect(() => {
        if (typeof window !== "undefined" && !lucidLoaded) {
            import("lucid-cardano").then((module) => {
                initializeLucid(module)
                setLucidLoaded(true)
            }).catch((error) => {
                console.error("Failed to load lucid-cardano:", error)
            })
        }
    }, [lucidLoaded])

    // Check available wallets
    useEffect(() => {
        if (typeof window !== "undefined") {
            checkAvailableWallets()
        }
    }, [])

    async function initializeLucid(lucidModule: any) {
        try {
            const blockfrostApiKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY
            if (!blockfrostApiKey) {
                console.warn("Blockfrost API key not found")
                return
            }

            const { Lucid, Blockfrost } = lucidModule
            let lucidInstance;
            try {
                lucidInstance = await Lucid.new(
                    new Blockfrost(
                        "https://cardano-preprod.blockfrost.io/api/v0",
                        blockfrostApiKey
                    ),
                    "Preprod"
                )
            } catch (err) {
                console.warn("Blockfrost initialization failed, falling back to wallet-only mode:", err)
                // Fallback: Initialize without provider (allows wallet connection but no independent querying)
                lucidInstance = await Lucid.new(undefined, "Preprod")
                setInitializationError("Limited Mode: Blockfrost connection failed. You can still connect your wallet.")
            }

            setLucid(lucidInstance)
            if (!initializationError) setInitializationError(null)
        } catch (error: any) {
            console.error("Failed to initialize Lucid:", error)
            setInitializationError(error.message || "Failed to initialize Cardano library")
        }
    }

    function checkAvailableWallets() {
        const wallets: WalletName[] = []
        const cardano = (window as any).cardano

        if (cardano) {
            if (cardano.nami) wallets.push("nami")
            if (cardano.eternl) wallets.push("eternl")
            if (cardano.lace) wallets.push("lace")
            if (cardano.flint) wallets.push("flint")
            if (cardano.typhon) wallets.push("typhon")
            if (cardano.gerowallet) wallets.push("gerowallet")
        }

        setAvailableWallets(wallets)
    }

    async function connectWallet(name: WalletName) {
        if (typeof window === "undefined") return

        setIsConnecting(true)

        try {
            const cardano = (window as any).cardano
            if (!cardano || !cardano[name]) {
                throw new Error(`${name} wallet not found. Please install it.`)
            }

            const api = await cardano[name].enable()

            if (!lucid) {
                throw new Error("Lucid not initialized. Please wait...")
            }

            lucid.selectWallet(api)
            const addr = await lucid.wallet.address()
            const utxos = await lucid.wallet.getUtxos()
            const totalLovelace = utxos.reduce((sum: bigint, utxo: any) => sum + utxo.assets.lovelace, BigInt(0))
            const ada = Number(totalLovelace) / 1_000_000

            setWalletName(name)
            setWalletApi(api)
            setAddress(addr)
            setBalance(ada.toFixed(2))
            setIsConnected(true)

            localStorage.setItem("cardano_wallet", name)
        } catch (error) {
            console.error("Failed to connect wallet:", error)
            throw error
        } finally {
            setIsConnecting(false)
        }
    }

    function disconnectWallet() {
        setWalletName(null)
        setWalletApi(null)
        setAddress(null)
        setBalance(null)
        setIsConnected(false)
        localStorage.removeItem("cardano_wallet")
    }

    async function switchNetwork(newNetwork: CardanoNetwork) {
        setNetwork(newNetwork)
        if (isConnected && walletName) {
            await connectWallet(walletName)
        }
    }

    return (
        <CardanoWalletContext.Provider
            value={{
                walletName,
                walletApi,
                address,
                balance,
                network,
                isConnected,
                isConnecting,
                lucid,
                connectWallet,
                disconnectWallet,
                switchNetwork,
                availableWallets,
                initializationError,
            }}
        >
            {children}
        </CardanoWalletContext.Provider>
    )
}

export function useCardanoWallet() {
    const context = useContext(CardanoWalletContext)
    if (context === undefined) {
        throw new Error("useCardanoWallet must be used within a CardanoWalletProvider")
    }
    return context
}
