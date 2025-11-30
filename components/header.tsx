import { ReactNode } from "react"
import { WalletConnectButton } from "@/components/wallet-connect-button"

interface HeaderProps {
    children?: ReactNode
    actions?: ReactNode
    className?: string
}

export function Header({ children, actions, className = "" }: HeaderProps) {
    return (
        <header className={`flex items-center justify-between p-6 border-b border-white/10 backdrop-blur-sm bg-white/5 ${className}`}>
            <div className="flex-1">
                {children}
            </div>
            <div className="flex items-center gap-4">
                {actions}
                <WalletConnectButton />
            </div>
        </header>
    )
}
