# Hydra Version Control - Architecture Reference

## System Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant UI as Version Control Page
    participant API as Backend API
    participant Hydra as Hydra Head
    participant IPFS as IPFS Storage
    participant L1 as Cardano L1

    Note over User,L1: 1. COMMIT FLOW (Instant)
    
    User->>UI: Edit code in Monaco Editor
    User->>UI: Click "Commit to Hydra"
    UI->>UI: Show commit dialog
    User->>UI: Enter commit message
    
    UI->>API: POST /api/hydra/commit
    API->>API: Generate commit hash
    API->>IPFS: Upload source code
    IPFS-->>API: Return CID
    API->>IPFS: Upload metadata
    IPFS-->>API: Return metadata CID
    API->>Hydra: Store commit
    Hydra-->>API: Commit ID
    API-->>UI: Success (< 1 sec)
    UI->>User: Show success toast
    UI->>UI: Update commit history
    
    Note over User,L1: 2. PUSH FLOW (Blockchain Settlement)
    
    User->>UI: Click "Push to Cardano L1"
    UI->>UI: Show confirmation dialog
    User->>UI: Confirm push
    
    UI->>API: POST /api/hydra/push
    API->>Hydra: Get all pending commits
    Hydra-->>API: Commit list
    API->>Hydra: Close Head & settle
    Hydra->>L1: Submit settlement tx
    L1-->>Hydra: Tx hash
    Hydra-->>API: Settlement tx hash
    API-->>UI: Tx hash
    
    UI->>User: Show "Settling..." status
    
    loop Poll for confirmation
        UI->>API: GET /api/hydra/status/:txHash
        API->>L1: Query tx status
        L1-->>API: Confirmation status
        API-->>UI: Status update
    end
    
    L1-->>UI: Confirmed!
    UI->>User: Show success
    UI->>UI: Update all commits to "L1 Confirmed"
    
    Note over User,L1: 3. BROWSE FLOW (View History)
    
    User->>UI: Open version history
    UI->>API: GET /api/versions/:id/history
    API->>Hydra: Get Hydra commits
    Hydra-->>API: Pending commits
    API->>L1: Get L1 versions
    L1-->>API: Confirmed versions
    API->>API: Merge & sort by timestamp
    API-->>UI: Combined history
    UI->>User: Display timeline
```

## Component Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        VCP[Version Control Page]
        CE[Code Editor - Monaco]
        CH[Commit History]
        DV[Diff Viewer]
        CD[Commit Dialog]
    end
    
    subgraph "API Layer"
        HC[Hydra Commit API]
        HP[Hydra Push API]
        VH[Version History API]
    end
    
    subgraph "Service Layer"
        HClient[Hydra Client]
        DiffGen[Diff Generator]
        IPFSClient[IPFS Client]
        CardanoClient[Cardano Client]
    end
    
    subgraph "Storage Layer"
        Hydra[Hydra Head<br/>Off-chain State]
        IPFS[IPFS<br/>Source Storage]
        L1[Cardano L1<br/>Final Registry]
    end
    
    VCP --> CE
    VCP --> CH
    VCP --> DV
    VCP --> CD
    
    CE --> HC
    CD --> HC
    CH --> VH
    DV --> VH
    CD --> HP
    
    HC --> HClient
    HC --> IPFSClient
    HC --> DiffGen
    
    HP --> HClient
    HP --> CardanoClient
    
    VH --> HClient
    VH --> CardanoClient
    
    HClient --> Hydra
    IPFSClient --> IPFS
    CardanoClient --> L1
    
    Hydra -.Settlement.-> L1
    
    classDef frontend fill:#a855f7,stroke:#7c3aed,color:#fff
    classDef api fill:#3b82f6,stroke:#2563eb,color:#fff
    classDef service fill:#10b981,stroke:#059669,color:#fff
    classDef storage fill:#f59e0b,stroke:#d97706,color:#fff
    
    class VCP,CE,CH,DV,CD frontend
    class HC,HP,VH api
    class HClient,DiffGen,IPFSClient,CardanoClient service
    class Hydra,IPFS,L1 storage
```

## Data Flow: Commit to L1

```mermaid
stateDiagram-v2
    [*] --> Editing: User opens editor
    
    Editing --> CommitDialog: Click "Commit"
    CommitDialog --> Editing: Cancel
    CommitDialog --> UploadingIPFS: Confirm commit
    
    UploadingIPFS --> StoringHydra: IPFS CIDs received
    StoringHydra --> HydraPending: Commit stored
    
    HydraPending --> HydraPending: More commits
    HydraPending --> PushDialog: Click "Push to L1"
    
    PushDialog --> HydraPending: Cancel
    PushDialog --> SettlingL1: Confirm push
    
    SettlingL1 --> WaitingConfirmation: Tx submitted
    WaitingConfirmation --> L1Confirmed: Blockchain confirms
    
    L1Confirmed --> [*]: Complete
    
    note right of HydraPending
        Status: "Committed to Hydra"
        Badge: Purple
        Instant feedback
    end note
    
    note right of L1Confirmed
        Status: "Confirmed on L1"
        Badge: Green
        Immutable record
    end note
```

## File Structure

```
d:\downloadds\AxoHub-BCH\
│
├── app/
│   ├── version-history/
│   │   └── page.tsx                    # ✏️ MODIFY - Main version control page
│   │
│   └── api/
│       └── hydra/
│           ├── commit/
│           │   └── route.ts            # 🆕 CREATE - Commit to Hydra
│           ├── push/
│           │   └── route.ts            # 🆕 CREATE - Push to L1
│           ├── commits/
│           │   └── [packageId]/
│           │       └── route.ts        # 🆕 CREATE - Get commits
│           └── status/
│               └── [txHash]/
│                   └── route.ts        # 🆕 CREATE - Check L1 status
│
├── components/
│   ├── code-editor.tsx                 # 🆕 CREATE - Monaco editor
│   ├── commit-dialog.tsx               # 🆕 CREATE - Commit message dialog
│   ├── commit-history.tsx              # 🆕 CREATE - Timeline view
│   ├── diff-viewer.tsx                 # 🆕 CREATE - Code diff display
│   └── hydra-status-indicator.tsx      # 🆕 CREATE - Head status badge
│
├── lib/
│   ├── hydra/
│   │   ├── client.ts                   # 🆕 CREATE - Hydra Head client
│   │   ├── storage.ts                  # 🆕 CREATE - Commit storage
│   │   └── diff.ts                     # 🆕 CREATE - Diff utilities
│   │
│   └── cardano/
│       ├── types.ts                    # ✏️ MODIFY - Add Hydra types
│       ├── query.ts                    # ✏️ MODIFY - Add Hydra queries
│       └── batch-publish.ts            # 🆕 CREATE - Batch L1 publish
│
└── types/
    └── version-control.ts              # 🆕 CREATE - Version control types
```

## Key Technologies

| Technology | Purpose | Why? |
|------------|---------|------|
| **Hydra Head** | Off-chain commits | Instant feedback, no blockchain wait |
| **Monaco Editor** | Code editing | Same editor as VS Code, familiar UX |
| **IPFS (Pinata)** | Source storage | Decentralized, immutable storage |
| **Cardano L1** | Final registry | Immutable, permanent record |
| **react-diff-view** | Diff display | GitHub-like diff visualization |
| **Framer Motion** | Animations | Smooth transitions, better UX |

## State Management

```typescript
// Version Control Page State
interface VersionControlState {
  // Editor state
  currentCode: string
  originalCode: string
  hasChanges: boolean
  language: 'plutus' | 'aiken' | 'solidity'
  
  // Hydra state
  hydraHeadStatus: 'open' | 'closed' | 'settling'
  pendingCommits: HydraCommit[]
  
  // L1 state
  confirmedVersions: L1Version[]
  
  // UI state
  isCommitDialogOpen: boolean
  isPushDialogOpen: boolean
  selectedCommitForDiff?: string
  
  // Loading states
  isCommitting: boolean
  isPushing: boolean
  isLoadingHistory: boolean
}
```

## API Response Types

```typescript
// POST /api/hydra/commit
interface CommitResponse {
  success: boolean
  commitId: string
  commitHash: string
  sourceCID: string
  metadataCID: string
  status: 'hydra_pending'
  timestamp: number
}

// POST /api/hydra/push
interface PushResponse {
  success: boolean
  txHash: string
  commitIds: string[]
  commitCount: number
  status: 'settling'
  estimatedConfirmationTime: number // seconds
}

// GET /api/versions/:id/history
interface VersionHistoryResponse {
  packageId: string
  packageName: string
  hydraCommits: HydraCommit[]
  l1Versions: L1Version[]
  combined: VersionHistoryItem[] // Merged & sorted
  hydraHeadStatus: 'open' | 'closed'
}
```

## Environment Variables

```bash
# Hydra Configuration
HYDRA_NODE_URL=http://localhost:4001
HYDRA_API_KEY=your_hydra_api_key
HYDRA_HEAD_TIMEOUT=3600  # 1 hour

# IPFS Configuration
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_key
NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret

# Cardano Configuration
NEXT_PUBLIC_BLOCKFROST_API_KEY=your_blockfrost_key
NEXT_PUBLIC_CARDANO_NETWORK=preprod

# Feature Flags
ENABLE_HYDRA_VERSION_CONTROL=true
MAX_HYDRA_COMMITS_BEFORE_PUSH=50
```

## Performance Targets

| Operation | Target | Current | Status |
|-----------|--------|---------|--------|
| Commit to Hydra | < 1s | TBD | 🟡 Pending |
| Push to L1 | < 30s | TBD | 🟡 Pending |
| Load editor | < 2s | TBD | 🟡 Pending |
| Generate diff | < 500ms | TBD | 🟡 Pending |
| Query history | < 1s | TBD | 🟡 Pending |

## Security Checklist

- [ ] Validate wallet ownership before commit
- [ ] Verify wallet signature on L1 push
- [ ] Sanitize commit messages (XSS prevention)
- [ ] Validate source code size limits
- [ ] Rate limit commit API (prevent spam)
- [ ] Encrypt Hydra Head communication
- [ ] Verify IPFS CID integrity
- [ ] Prevent unauthorized Head closure

## Monitoring & Alerts

```typescript
// Metrics to track
const metrics = {
  hydra: {
    headUptime: 'percentage',
    commitLatency: 'milliseconds',
    settlementSuccessRate: 'percentage',
    activeHeads: 'count'
  },
  
  api: {
    commitEndpointLatency: 'milliseconds',
    pushEndpointLatency: 'milliseconds',
    errorRate: 'percentage'
  },
  
  user: {
    commitsPerDay: 'count',
    pushesPerDay: 'count',
    averageCommitsBeforePush: 'count'
  }
}
```

## Rollback Plan

If Hydra integration fails:

1. **Immediate:** Disable Hydra feature flag
2. **Fallback:** Direct L1 publishing (existing flow)
3. **Data:** Export Hydra commits to IPFS
4. **Notify:** Alert users of temporary downtime
5. **Debug:** Check Hydra node logs
6. **Restore:** Re-enable after fix confirmed

---

## Quick Reference Commands

```bash
# Start Hydra node (local development)
hydra-node --testnet-magic 1 --node-socket /path/to/node.socket

# Check Hydra Head status
curl http://localhost:4001/heads

# Monitor Hydra logs
tail -f ~/.hydra/logs/hydra-node.log

# Test commit API
curl -X POST http://localhost:3000/api/hydra/commit \
  -H "Content-Type: application/json" \
  -d '{"packageId":"test","version":"1.0.1","sourceCode":"...","message":"Test commit"}'
```

---

**Status:** Architecture design complete ✅  
**Next:** Begin implementation Phase 1
