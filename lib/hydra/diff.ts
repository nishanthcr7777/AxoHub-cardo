import * as diff from 'diff';

/**
 * Compute line-by-line diff between two strings
 */
export function computeDiff(oldText: string, newText: string): diff.Change[] {
    return diff.diffLines(oldText, newText);
}

/**
 * Format diff changes into a readable string
 */
export function formatDiff(changes: diff.Change[]): string {
    return changes.map((change: diff.Change) => {
        const prefix = change.added ? '+ ' : change.removed ? '- ' : '  ';
        // Handle multi-line values
        if (change.value.endsWith('\n')) {
            // Remove trailing newline for splitting to avoid empty last line
            return change.value.slice(0, -1).split('\n').map((line: string) => {
                return prefix + line;
            }).join('\n') + '\n';
        }

        return change.value.split('\n').map((line: string) => {
            if (!line && change.value.length > 0) return ''; // Skip empty lines from split if not intended
            return prefix + line;
        }).join('\n');
    }).join('');
}
