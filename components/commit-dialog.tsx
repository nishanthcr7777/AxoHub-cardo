"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { GitCommit, Loader2 } from 'lucide-react'

interface CommitDialogProps {
    isOpen: boolean
    onClose: () => void
    onCommit: (message: string, version: string) => void
    stats: { added: number, removed: number }
    isCommitting?: boolean
}

export function CommitDialog({ isOpen, onClose, onCommit, stats, isCommitting = false }: CommitDialogProps) {
    const [message, setMessage] = useState('')
    const [version, setVersion] = useState('')

    const handleCommit = () => {
        if (!message.trim() || !version.trim()) return
        onCommit(message, version)
        setMessage('')
        setVersion('')
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isCommitting && !open && onClose()}>
            <DialogContent className="bg-slate-900 border-slate-700 sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <GitCommit className="w-5 h-5 text-purple-500" />
                        Commit to Hydra
                    </DialogTitle>
                    <DialogDescription>
                        Review your changes and commit them to the Hydra Head.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-slate-300">Version</Label>
                        <Input
                            value={version}
                            onChange={(e) => setVersion(e.target.value)}
                            placeholder="e.g., 1.0.1"
                            className="bg-slate-800 border-slate-700 text-white focus:border-purple-500"
                            disabled={isCommitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-300">Commit Message</Label>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Describe your changes..."
                            className="bg-slate-800 border-slate-700 text-white min-h-[100px] focus:border-purple-500"
                            disabled={isCommitting}
                        />
                    </div>

                    <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 flex gap-4">
                        <div className="text-sm">
                            <span className="text-slate-400">Changes:</span>
                        </div>
                        <div className="text-sm font-mono">
                            <span className="text-green-400">+{stats.added}</span>
                            <span className="text-slate-600 mx-2">|</span>
                            <span className="text-red-400">-{stats.removed}</span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                        disabled={isCommitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCommit}
                        disabled={!message.trim() || !version.trim() || isCommitting}
                        className="bg-purple-600 hover:bg-purple-700 text-white min-w-[120px]"
                    >
                        {isCommitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Committing...
                            </>
                        ) : (
                            <>
                                <GitCommit className="w-4 h-4 mr-2" />
                                Commit
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
