"use client"

/**
 * ZK Verify Button - Trigger Midnight ZK proof generation
 */

import { useState } from "react"
import { Button } from "./ui/button"
import { ZKProofDialog } from "@/components/zk-proof-dialog"
import { Loader2 } from "lucide-react"
import { CompactProof } from "@/lib/zk/midnight-client"

interface ZKVerifyButtonProps {
    nftId?: string
    onProofGenerated?: (proof: CompactProof) => void
    className?: string
}

export function ZKVerifyButton({
    nftId,
    onProofGenerated,
    className
}: ZKVerifyButtonProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

    const handleClick = () => {
        setIsDialogOpen(true)
    }

    return (
        <>
            <Button
                onClick={handleClick}
                disabled={isGenerating}
                className={`bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 ${className}`}
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Proof...
                    </>
                ) : (
                    <>
                        <span className="mr-2">🌑</span>
                        ZK Verify Access Key (Midnight)
                    </>
                )}
            </Button>

            <ZKProofDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                initialNftId={nftId}
                onProofGenerated={(proof: CompactProof) => {
                    setIsGenerating(false)
                    onProofGenerated?.(proof)
                }}
                onGeneratingChange={setIsGenerating}
            />
        </>
    )
}
