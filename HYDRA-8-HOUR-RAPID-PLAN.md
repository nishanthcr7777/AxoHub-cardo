# 🚀 Hydra Version Control - 8 Hour Rapid Implementation

**Goal:** Working Git-like version control with Hydra commits and L1 push in ONE DAY

**Architecture:** Single shared Hydra Head, query directly (no Redis/separate storage)

**Timeline:** 8 hours (1 working day)

---

## ⚡ Simplified Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Version Control Page (Monaco Editor + Commit UI)       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Hydra Client (Direct WebSocket to Hydra Node)         │
└────────┬────────────────────────┬─────────────────────┘
         │                        │
         ▼                        ▼
    ┌─────────┐              ┌─────────┐
    │  Hydra  │              │  IPFS   │
    │  Head   │──Settlement─→│ Pinata  │
    │ (Single)│              └─────────┘
    └─────────┘                    
         │
         │ Push
         ▼
    ┌─────────────┐
    │  Cardano L1 │
    └─────────────┘
```

**Key Decisions:**
- ✅ Single Hydra Head for ALL packages (simpler)
- ✅ Query Hydra directly via WebSocket (no Redis)
- ✅ Minimal Docker setup for Hydra node
- ✅ IPFS upload on commit (not on push)

---

## 📅 8-Hour Timeline

### Hour 0-1: Setup & Infrastructure
- [ ] Set up minimal Hydra Docker container
- [ ] Create basic Hydra client wrapper
- [ ] Test Hydra Head open/close

### Hour 1-2: Data Models & Types
- [ ] Add Hydra types to `lib/cardano/types.ts`
- [ ] Create `lib/hydra/client.ts` (minimal)
- [ ] Create `lib/hydra/diff.ts` (basic diff)

### Hour 2-4: Code Editor & UI
- [ ] Install Monaco Editor
- [ ] Create `components/code-editor.tsx`
- [ ] Update `app/version-history/page.tsx` with editor
- [ ] Add basic commit button

### Hour 4-5: Commit Flow
- [ ] Create commit dialog component
- [ ] Implement `POST /api/hydra/commit`
- [ ] Upload to IPFS on commit
- [ ] Store in Hydra state

### Hour 5-6: Commit History
- [ ] Query Hydra for commits
- [ ] Create timeline component
- [ ] Show Hydra vs L1 badges

### Hour 6-7: Push to L1
- [ ] Implement `POST /api/hydra/push`
- [ ] Close Hydra Head and settle
- [ ] Submit batch transaction to Cardano
- [ ] Track confirmation

### Hour 7-8: Testing & Polish
- [ ] Test full flow (edit → commit → push)
- [ ] Add error handling
- [ ] Add loading states
- [ ] Quick UI polish

---

## 🛠️ Hour-by-Hour Implementation

## HOUR 0-1: Hydra Setup

### Step 1.1: Minimal Hydra Docker (15 min)

Create `docker-compose.hydra.yml`:

```yaml
version: '3.8'

services:
  hydra-node:
    image: inputoutput/hydra-node:latest
    container_name: axohub-hydra
    ports:
      - "4001:4001"  # API port
      - "5001:5001"  # WebSocket port
    environment:
      - HYDRA_API_HOST=0.0.0.0
      - HYDRA_API_PORT=4001
      - HYDRA_NETWORK=preprod
    volumes:
      - ./hydra-data:/data
    command: >
      hydra-node
      --node-socket /data/node.socket
      --testnet-magic 1
      --api-host 0.0.0.0
      --api-port 4001
```

**Run:**
```bash
docker-compose -f docker-compose.hydra.yml up -d
```

### Step 1.2: Create Hydra Client (30 min)

Create `lib/hydra/client.ts`:

```typescript
/**
 * Minimal Hydra Client - Direct WebSocket connection
 */

interface HydraCommit {
  id: string
  packageId: string
  version: string
  sourceCode: string
  sourceCID: string
  metadataCID: string
  message: string
  author: string
  timestamp: number
  commitHash: string
  status: 'hydra_pending' | 'pushed_to_l1'
}

class HydraClient {
  private ws: WebSocket | null = null
  private headId: string | null = null
  
  constructor(private url: string = 'ws://localhost:5001') {}
  
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url)
      this.ws.onopen = () => resolve()
      this.ws.onerror = (err) => reject(err)
    })
  }
  
  async openHead(): Promise<string> {
    if (!this.ws) await this.connect()
    
    // Send Init command to Hydra
    this.ws!.send(JSON.stringify({
      tag: 'Init',
      contestationPeriod: 60 // 60 seconds
    }))
    
    // Wait for HeadIsInitialized response
    return new Promise((resolve) => {
      this.ws!.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        if (msg.tag === 'HeadIsInitialized') {
          this.headId = msg.headId
          resolve(msg.headId)
        }
      }
    })
  }
  
  async commit(commit: HydraCommit): Promise<string> {
    if (!this.headId) throw new Error('Head not initialized')
    
    // Store commit in Hydra state
    this.ws!.send(JSON.stringify({
      tag: 'NewTx',
      transaction: {
        type: 'commit',
        data: commit
      }
    }))
    
    return commit.id
  }
  
  async getCommits(packageId?: string): Promise<HydraCommit[]> {
    if (!this.headId) return []
    
    // Query Hydra snapshot
    this.ws!.send(JSON.stringify({ tag: 'GetUTxO' }))
    
    return new Promise((resolve) => {
      this.ws!.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        if (msg.tag === 'SnapshotConfirmed') {
          const commits = this.parseCommitsFromSnapshot(msg.snapshot)
          resolve(packageId 
            ? commits.filter(c => c.packageId === packageId)
            : commits
          )
        }
      }
    })
  }
  
  async closeAndSettle(): Promise<string> {
    if (!this.headId) throw new Error('Head not initialized')
    
    // Close Hydra Head
    this.ws!.send(JSON.stringify({ tag: 'Close' }))
    
    return new Promise((resolve) => {
      this.ws!.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        if (msg.tag === 'HeadIsClosed') {
          resolve(msg.snapshotNumber)
        }
      }
    })
  }
  
  private parseCommitsFromSnapshot(snapshot: any): HydraCommit[] {
    // Parse UTxO set to extract commits
    // Simplified: assume commits are stored as datum
    return Object.values(snapshot.utxo || {})
      .filter((utxo: any) => utxo.datum?.type === 'commit')
      .map((utxo: any) => utxo.datum.data)
  }
}

export const hydraClient = new HydraClient()
export type { HydraCommit }
```

### Step 1.3: Test Connection (15 min)

Create `scripts/test-hydra.ts`:

```typescript
import { hydraClient } from '../lib/hydra/client'

async function testHydra() {
  console.log('🔌 Connecting to Hydra...')
  await hydraClient.connect()
  
  console.log('🚀 Opening Head...')
  const headId = await hydraClient.openHead()
  console.log('✅ Head opened:', headId)
  
  console.log('📦 Testing commit...')
  await hydraClient.commit({
    id: 'test-1',
    packageId: 'test-package',
    version: '1.0.0',
    sourceCode: 'test code',
    sourceCID: 'QmTest',
    metadataCID: 'QmMeta',
    message: 'Test commit',
    author: 'addr_test1...',
    timestamp: Date.now(),
    commitHash: 'abc123',
    status: 'hydra_pending'
  })
  console.log('✅ Commit stored')
  
  console.log('📋 Querying commits...')
  const commits = await hydraClient.getCommits()
  console.log('✅ Found commits:', commits.length)
}

testHydra().catch(console.error)
```

**Run:**
```bash
npx tsx scripts/test-hydra.ts
```

---

## HOUR 1-2: Data Models & Utilities

### Step 2.1: Update Types (15 min)

Update `lib/cardano/types.ts`:

```typescript
// Add to existing file

export interface HydraCommit {
  id: string
  packageId: string
  version: string
  sourceCode: string
  sourceCID: string
  metadataCID: string
  message: string
  author: string
  timestamp: number
  commitHash: string
  parentCommitHash?: string
  status: 'hydra_pending' | 'pushed_to_l1'
  linesAdded?: number
  linesRemoved?: number
}

export interface VersionHistoryItem {
  id: string
  type: 'hydra' | 'l1'
  version: string
  message?: string
  timestamp: number
  author: string
  sourceCID: string
  status: 'pending' | 'confirmed'
  commitData?: HydraCommit
  l1Data?: RegistryDatum
}
```

### Step 2.2: Create Diff Utility (30 min)

Create `lib/hydra/diff.ts`:

```typescript
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

export function generateCommitHash(code: string): string {
  // Simple SHA-256 hash
  const encoder = new TextEncoder()
  const data = encoder.encode(code)
  return crypto.subtle.digest('SHA-256', data)
    .then(hash => {
      const hashArray = Array.from(new Uint8Array(hash))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    })
}
```

**Install dependency:**
```bash
npm install diff
npm install --save-dev @types/diff
```

### Step 2.3: Create Helper Functions (15 min)

Create `lib/hydra/utils.ts`:

```typescript
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
```

---

## HOUR 2-4: Code Editor & UI

### Step 3.1: Install Monaco (5 min)

```bash
npm install @monaco-editor/react monaco-editor
```

### Step 3.2: Create Code Editor Component (45 min)

Create `components/code-editor.tsx`:

```typescript
"use client"

import { Editor } from '@monaco-editor/react'
import { Card } from './ui/card'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: 'plutus' | 'aiken' | 'solidity'
  readOnly?: boolean
  height?: string
}

export function CodeEditor({ 
  value, 
  onChange, 
  language, 
  readOnly = false,
  height = '500px'
}: CodeEditorProps) {
  
  const languageMap = {
    plutus: 'haskell',
    aiken: 'rust',
    solidity: 'solidity'
  }
  
  return (
    <Card className="overflow-hidden bg-slate-950 border-slate-800">
      <Editor
        height={height}
        language={languageMap[language]}
        value={value}
        onChange={(val) => onChange(val || '')}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
        }}
      />
    </Card>
  )
}
```

### Step 3.3: Create Commit Dialog (30 min)

Create `components/commit-dialog.tsx`:

```typescript
"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'

interface CommitDialogProps {
  isOpen: boolean
  onClose: () => void
  onCommit: (message: string, version: string) => void
  stats: { added: number, removed: number }
}

export function CommitDialog({ isOpen, onClose, onCommit, stats }: CommitDialogProps) {
  const [message, setMessage] = useState('')
  const [version, setVersion] = useState('')
  
  const handleCommit = () => {
    if (!message.trim() || !version.trim()) return
    onCommit(message, version)
    setMessage('')
    setVersion('')
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Commit to Hydra</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-slate-300">Version</Label>
            <Input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g., 1.0.1"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          
          <div>
            <Label className="text-slate-300">Commit Message</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your changes..."
              className="bg-slate-800 border-slate-700 text-white"
              rows={3}
            />
          </div>
          
          <div className="bg-slate-800 p-3 rounded-lg">
            <p className="text-sm text-slate-400">Changes:</p>
            <p className="text-sm text-green-400">+{stats.added} lines added</p>
            <p className="text-sm text-red-400">-{stats.removed} lines removed</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleCommit}
              disabled={!message.trim() || !version.trim()}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              Commit to Hydra
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-slate-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### Step 3.4: Update Version History Page (40 min)

Update `app/version-history/page.tsx`:

```typescript
"use client"

import { useState, useEffect } from "react"
import { CodeEditor } from "@/components/code-editor"
import { CommitDialog } from "@/components/commit-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { GitCommit, Upload, Send } from "lucide-react"
import { generateDiff, calculateStats } from "@/lib/hydra/diff"
import { toast } from "sonner"

export default function VersionHistoryPage() {
  const [code, setCode] = useState("")
  const [originalCode, setOriginalCode] = useState("")
  const [isCommitDialogOpen, setIsCommitDialogOpen] = useState(false)
  const [stats, setStats] = useState({ added: 0, removed: 0 })
  const [hasChanges, setHasChanges] = useState(false)
  
  useEffect(() => {
    if (code !== originalCode) {
      const diff = generateDiff(originalCode, code)
      setStats(calculateStats(diff))
      setHasChanges(true)
    } else {
      setHasChanges(false)
    }
  }, [code, originalCode])
  
  const handleCommit = async (message: string, version: string) => {
    try {
      const response = await fetch('/api/hydra/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceCode: code,
          message,
          version,
          packageId: 'test-package' // TODO: Get from context
        })
      })
      
      if (!response.ok) throw new Error('Commit failed')
      
      const result = await response.json()
      toast.success('Committed to Hydra!')
      setOriginalCode(code)
      setIsCommitDialogOpen(false)
    } catch (error) {
      toast.error('Failed to commit')
      console.error(error)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Version Control</h1>
            <p className="text-slate-400">Edit, commit to Hydra, push to Cardano</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setIsCommitDialogOpen(true)}
              disabled={!hasChanges}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <GitCommit className="w-4 h-4 mr-2" />
              Commit to Hydra
            </Button>
            
            <Button
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Push to L1
            </Button>
          </div>
        </div>
        
        {/* Changes Summary */}
        {hasChanges && (
          <Card className="p-4 bg-slate-800/50 border-purple-500/30">
            <p className="text-sm text-slate-300">
              <span className="text-green-400">+{stats.added}</span> / 
              <span className="text-red-400 ml-1">-{stats.removed}</span> lines changed
            </p>
          </Card>
        )}
        
        {/* Code Editor */}
        <CodeEditor
          value={code}
          onChange={setCode}
          language="aiken"
          height="600px"
        />
        
        {/* Commit Dialog */}
        <CommitDialog
          isOpen={isCommitDialogOpen}
          onClose={() => setIsCommitDialogOpen(false)}
          onCommit={handleCommit}
          stats={stats}
        />
      </div>
    </div>
  )
}
```

---

## HOUR 4-5: Commit Flow & API

### Step 4.1: Create Commit API (45 min)

Create `app/api/hydra/commit/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { hydraClient } from '@/lib/hydra/client'
import { generateCommitId } from '@/lib/hydra/utils'
import { generateCommitHash } from '@/lib/hydra/diff'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sourceCode, message, version, packageId } = body
    
    // Validate
    if (!sourceCode || !message || !version || !packageId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Upload to IPFS
    const sourceCID = await uploadToIPFS(sourceCode)
    const metadataCID = await uploadToIPFS(JSON.stringify({
      version,
      message,
      timestamp: Date.now()
    }))
    
    // Generate commit hash
    const commitHash = await generateCommitHash(sourceCode)
    
    // Create commit
    const commit = {
      id: generateCommitId(),
      packageId,
      version,
      sourceCode,
      sourceCID,
      metadataCID,
      message,
      author: 'addr_test1...', // TODO: Get from wallet
      timestamp: Date.now(),
      commitHash,
      status: 'hydra_pending' as const
    }
    
    // Store in Hydra
    await hydraClient.commit(commit)
    
    return NextResponse.json({
      success: true,
      commitId: commit.id,
      commitHash,
      sourceCID,
      status: 'hydra_pending'
    })
    
  } catch (error) {
    console.error('Commit error:', error)
    return NextResponse.json(
      { error: 'Failed to commit' },
      { status: 500 }
    )
  }
}

async function uploadToIPFS(content: string): Promise<string> {
  // TODO: Implement Pinata upload
  // For now, return mock CID
  return `Qm${Math.random().toString(36).substr(2, 44)}`
}
```

### Step 4.2: Test Commit Flow (15 min)

Test the full flow:
1. Edit code in Monaco
2. Click "Commit to Hydra"
3. Fill commit dialog
4. Verify commit stored in Hydra

---

## HOUR 5-6: Commit History UI

### Step 5.1: Create Commit History Component (40 min)

Create `components/commit-history.tsx`:

```typescript
"use client"

import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { GitCommit, CheckCircle } from 'lucide-react'
import { HydraCommit, VersionHistoryItem } from '@/lib/cardano/types'
import { formatTimestamp } from '@/lib/hydra/utils'

interface CommitHistoryProps {
  items: VersionHistoryItem[]
}

export function CommitHistory({ items }: CommitHistoryProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white">Commit History</h3>
      
      {items.length === 0 ? (
        <Card className="p-8 bg-slate-800/50 border-slate-700 text-center">
          <p className="text-slate-400">No commits yet</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card 
              key={item.id}
              className="p-4 bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {item.type === 'hydra' ? (
                      <GitCommit className="w-4 h-4 text-purple-400" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                    <span className="font-semibold text-white">v{item.version}</span>
                    <Badge 
                      variant="outline"
                      className={
                        item.type === 'hydra'
                          ? 'border-purple-500/30 text-purple-300'
                          : 'border-green-500/30 text-green-300'
                      }
                    >
                      {item.type === 'hydra' ? 'Hydra' : 'L1'}
                    </Badge>
                  </div>
                  
                  {item.message && (
                    <p className="text-sm text-slate-300 mb-2">{item.message}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{formatTimestamp(item.timestamp)}</span>
                    <span>{item.author.slice(0, 12)}...</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Step 5.2: Add History to Page (20 min)

Update `app/version-history/page.tsx` to include commit history:

```typescript
// Add to existing page
import { CommitHistory } from "@/components/commit-history"
import { VersionHistoryItem } from "@/lib/cardano/types"

// Add state
const [history, setHistory] = useState<VersionHistoryItem[]>([])

// Add useEffect to load history
useEffect(() => {
  loadHistory()
}, [])

const loadHistory = async () => {
  try {
    const response = await fetch('/api/hydra/commits/test-package')
    const data = await response.json()
    setHistory(data.items)
  } catch (error) {
    console.error('Failed to load history:', error)
  }
}

// Add to layout (two-column)
<div className="grid grid-cols-3 gap-6">
  <div className="col-span-2">
    {/* Code Editor */}
  </div>
  <div>
    <CommitHistory items={history} />
  </div>
</div>
```

---

## HOUR 6-7: Push to L1

### Step 6.1: Create Push API (40 min)

Create `app/api/hydra/push/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { hydraClient } from '@/lib/hydra/client'
import { Lucid, Blockfrost } from 'lucid-cardano'

export async function POST(request: NextRequest) {
  try {
    const { packageId } = await request.json()
    
    // Get all pending Hydra commits
    const commits = await hydraClient.getCommits(packageId)
    const pending = commits.filter(c => c.status === 'hydra_pending')
    
    if (pending.length === 0) {
      return NextResponse.json({ error: 'No pending commits' }, { status: 400 })
    }
    
    // Close Hydra Head and get settlement
    await hydraClient.closeAndSettle()
    
    // Build Cardano transaction with all commits
    const lucid = await Lucid.new(
      new Blockfrost(
        process.env.NEXT_PUBLIC_BLOCKFROST_URL!,
        process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY!
      ),
      'Preprod'
    )
    
    // Build transaction metadata (batch all commits)
    const metadata = {
      721: {
        registry: {
          type: 'package',
          name: packageId,
          version: pending[pending.length - 1].version, // Latest version
          sourceCID: pending[pending.length - 1].sourceCID,
          metadataCID: pending[pending.length - 1].metadataCID,
          publisher: pending[0].author,
          timestamp: Date.now(),
          hydraCommits: pending.map(c => c.id) // Track all commits
        }
      }
    }
    
    const tx = await lucid
      .newTx()
      .attachMetadata(721, metadata)
      .complete()
    
    // TODO: Sign with wallet (requires wallet connection)
    // const signedTx = await tx.sign().complete()
    // const txHash = await signedTx.submit()
    
    // For now, return mock tx hash
    const txHash = `mock_tx_${Date.now()}`
    
    return NextResponse.json({
      success: true,
      txHash,
      commitCount: pending.length,
      status: 'settling'
    })
    
  } catch (error) {
    console.error('Push error:', error)
    return NextResponse.json({ error: 'Failed to push' }, { status: 500 })
  }
}
```

### Step 6.2: Add Push Button Handler (20 min)

Update `app/version-history/page.tsx`:

```typescript
const [isPushing, setIsPushing] = useState(false)

const handlePush = async () => {
  if (!confirm('Push all Hydra commits to Cardano L1?')) return
  
  setIsPushing(true)
  try {
    const response = await fetch('/api/hydra/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId: 'test-package' })
    })
    
    if (!response.ok) throw new Error('Push failed')
    
    const result = await response.json()
    toast.success(`Pushed ${result.commitCount} commits to L1!`)
    
    // Reload history
    await loadHistory()
  } catch (error) {
    toast.error('Failed to push to L1')
    console.error(error)
  } finally {
    setIsPushing(false)
  }
}

// Update button
<Button
  onClick={handlePush}
  disabled={isPushing}
  className="bg-green-600 hover:bg-green-700"
>
  {isPushing ? 'Pushing...' : 'Push to L1'}
</Button>
```

---

## HOUR 7-8: Testing & Polish

### Step 7.1: End-to-End Test (30 min)

Test complete flow:

1. **Start Hydra node:**
   ```bash
   docker-compose -f docker-compose.hydra.yml up -d
   ```

2. **Start Next.js:**
   ```bash
   npm run dev
   ```

3. **Test flow:**
   - Open http://localhost:3000/version-history
   - Edit code in Monaco
   - Click "Commit to Hydra"
   - Fill commit message
   - Verify commit appears in history
   - Make another change
   - Commit again
   - Click "Push to L1"
   - Verify both commits batched

### Step 7.2: Add Error Handling (15 min)

Add try-catch blocks and user-friendly error messages:

```typescript
// In commit handler
try {
  // ... commit logic
} catch (error) {
  if (error.message.includes('Hydra')) {
    toast.error('Hydra node not available. Please check connection.')
  } else if (error.message.includes('IPFS')) {
    toast.error('Failed to upload to IPFS. Please try again.')
  } else {
    toast.error('Commit failed. Please try again.')
  }
}
```

### Step 7.3: Add Loading States (15 min)

Add loading indicators:

```typescript
{isCommitting && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <Card className="p-6 bg-slate-900">
      <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-2" />
      <p className="text-white">Committing to Hydra...</p>
    </Card>
  </div>
)}
```

---

## 🎯 Final Checklist

### Core Features
- [ ] Hydra node running in Docker
- [ ] Monaco code editor working
- [ ] Commit to Hydra (< 1 sec)
- [ ] Commit history display
- [ ] Push to L1 (batch commits)
- [ ] Status badges (Hydra/L1)

### UI/UX
- [ ] Loading states
- [ ] Error messages
- [ ] Success toasts
- [ ] Responsive layout

### Testing
- [ ] Edit → Commit flow
- [ ] Multiple commits
- [ ] Push to L1
- [ ] Error handling

---

## 📦 Dependencies Summary

```json
{
  "dependencies": {
    "@monaco-editor/react": "^4.6.0",
    "monaco-editor": "^0.45.0",
    "diff": "^5.1.0",
    "lucid-cardano": "^0.10.7"
  },
  "devDependencies": {
    "@types/diff": "^5.0.9"
  }
}
```

---

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies
npm install @monaco-editor/react monaco-editor diff lucid-cardano
npm install --save-dev @types/diff

# 2. Start Hydra node
docker-compose -f docker-compose.hydra.yml up -d

# 3. Test Hydra connection
npx tsx scripts/test-hydra.ts

# 4. Start dev server
npm run dev

# 5. Open version control page
# http://localhost:3000/version-history
```

---

## ✅ Success Criteria (8 Hours)

- ✅ Working code editor with syntax highlighting
- ✅ Commit to Hydra in < 1 second
- ✅ Commit history showing Hydra commits
- ✅ Push to L1 batching multiple commits
- ✅ Basic error handling
- ✅ Responsive UI

**Not included in 8 hours (future):**
- Advanced diff viewer
- Multi-file support
- Wallet integration for L1 signing
- Production Hydra node setup
- Comprehensive testing

---

## 🎉 You're Done!

After 8 hours, you'll have a working Git-like version control system with:
- Instant commits to Hydra
- Batch push to Cardano L1
- Monaco code editor
- Commit history timeline

**Next steps:** Polish UI, add wallet signing, deploy to production!
