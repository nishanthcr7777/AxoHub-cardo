/**
 * Simple diff generator using diff library
 */
import { diffLines } from 'diff'

export function generateDiff(oldCode: string, newCode: string): string {
    const changes = diffLines(oldCode, newCode)

    let diff = ''
    changes.forEach(change => {
        const prefix = change.added ? '+' : change.removed ? '-' : ' '
        const lines = change.value.split('\n')
        lines.forEach(line => {
            if (line) diff += `${prefix} ${line}\n`
        })
    })

    return diff
}

export function calculateStats(diff: string): { added: number, removed: number } {
    const lines = diff.split('\n')
    return {
        added: lines.filter(l => l.startsWith('+')).length,
        removed: lines.filter(l => l.startsWith('-')).length
    }
}

export function generateCommitHash(code: string): Promise<string> {
    // Simple SHA-256 hash
    const encoder = new TextEncoder()
    const data = encoder.encode(code)
    return crypto.subtle.digest('SHA-256', data)
        .then(hash => {
            const hashArray = Array.from(new Uint8Array(hash))
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        })
}
