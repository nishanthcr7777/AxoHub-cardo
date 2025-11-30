export function generateCommitId(): string {
    return `commit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function formatTimestamp(timestamp: number): string {
    const now = Date.now()
    const diff = now - timestamp

    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`
    return new Date(timestamp).toLocaleDateString()
}

export function truncateHash(hash: string, length: number = 8): string {
    return `${hash.slice(0, length)}...${hash.slice(-4)}`
}
