"use client"

import { HydraCommit } from "@/lib/cardano/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { GitCommit, Circle, CheckCircle2, Clock } from "lucide-react"
import { formatTimestamp, truncateHash } from "@/lib/hydra/utils"

interface CommitHistoryProps {
    commits: HydraCommit[]
    onSelectCommit: (commit: HydraCommit) => void
    selectedCommitId?: string
}

export function CommitHistory({ commits, onSelectCommit, selectedCommitId }: CommitHistoryProps) {
    if (commits.length === 0) {
        return (
            <div className="text-center p-8 text-slate-500">
                <GitCommit className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No commits yet</p>
            </div>
        )
    }

    return (
        <ScrollArea className="h-[600px] pr-4">
            <div className="relative space-y-6 pl-4 before:absolute before:inset-0 before:ml-[19px] before:h-full before:w-0.5 before:-translate-x-1/2 before:bg-slate-800 before:content-['']">
                {commits.map((commit) => (
                    <div
                        key={commit.id}
                        className="relative flex gap-4 group cursor-pointer"
                        onClick={() => onSelectCommit(commit)}
                    >
                        {/* Timeline Node */}
                        <div className={`absolute left-0 mt-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full border ring-4 ring-slate-950 ${commit.status === 'pushed_to_l1'
                                ? 'bg-green-500 border-green-500'
                                : 'bg-purple-500 border-purple-500'
                            }`} />

                        {/* Content Card */}
                        <div className={`flex-1 rounded-lg border p-3 transition-all ${selectedCommitId === commit.id
                                ? 'bg-slate-800 border-purple-500/50'
                                : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/50'
                            }`}>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-white">
                                        v{commit.version}
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className={`text-[10px] h-5 px-1.5 ${commit.status === 'pushed_to_l1'
                                                ? 'border-green-500/30 text-green-400'
                                                : 'border-purple-500/30 text-purple-400'
                                            }`}
                                    >
                                        {commit.status === 'pushed_to_l1' ? 'L1' : 'Hydra'}
                                    </Badge>
                                </div>
                                <span className="text-xs text-slate-500 font-mono">
                                    {truncateHash(commit.commitHash)}
                                </span>
                            </div>

                            <p className="text-sm text-slate-300 mb-2 line-clamp-2">
                                {commit.message}
                            </p>

                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatTimestamp(commit.timestamp)}
                                </div>
                                <div className="flex items-center gap-2">
                                    {commit.linesAdded !== undefined && (
                                        <span className="text-green-500/70">+{commit.linesAdded}</span>
                                    )}
                                    {commit.linesRemoved !== undefined && (
                                        <span className="text-red-500/70">-{commit.linesRemoved}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}
