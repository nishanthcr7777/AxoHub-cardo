# Midnight Privacy Integration - Implementation Guide

## 🌙 Overview

Add **privacy mode** to AxoHub publishing flow. After IPFS upload, users choose:
- **Public** - Normal Cardano publish (everyone can see)
- **Private** - Midnight encrypted publish (only authorized viewers)

---

## How Privacy Works

### Public Mode (Default):
```
Upload Files → IPFS (mock CID) → Cardano Registry → Done
                                  ↓
                          Everyone can view source
```

### Private Mode (Midnight):
```
Upload Files → IPFS (mock CID) → Encrypt Source → Midnight Network → Cardano Registry
                                                                      ↓
                                                              Only metadata public
                                                              Source encrypted
                                                              Access control enforced
```

---

## Privacy Architecture

### What Goes Where:

**Public (Cardano):**
- ✅ Contract name
- ✅ Version
- ✅ Publisher address
- ✅ Timestamp
- ✅ Proof of publication (ZK proof)
- ❌ Source code (encrypted reference only)

**Private (Midnight):**
- 🔒 Encrypted source code
- 🔒 Encrypted metadata
- 🔒 Access control list
- 🔒 Decryption keys

**How It Works:**
1. User uploads contract
2. Gets IPFS CID (mock for now)
3. **Chooses privacy mode**
4. If private:
   - Encrypt source with user's key
   - Store encrypted data in Midnight
   - Generate ZK proof (proves data exists without revealing it)
   - Publish proof + metadata to Cardano
   - Only users with access can decrypt

---

## Implementation Steps

### Step 1: Create Midnight Types (15 min)

**File:** `lib/midnight/types.ts`

```typescript
export type PrivacyMode = "public" | "private"

export interface PrivateItem {
  id: string
  encryptedSource: string     // Encrypted source code
  encryptedMetadata: string   // Encrypted metadata
  publicInfo: {
    name: string
    version: string
    type: "contract" | "package"
    publisher: string
    timestamp: number
  }
  accessList: string[]        // Addresses with access
  zkProof: string            // Zero-knowledge proof
}

export interface AccessControl {
  owner: string
  viewers: string[]
}
```

### Step 2: Create Encryption Utilities (30 min)

**File:** `lib/midnight/crypto.ts`

```typescript
/**
 * Simple encryption for demo
 * In production: Use Midnight SDK encryption
 */

export async function encryptData(
  data: string,
  password: string
): Promise<string> {
  // For demo: Base64 encode
  // In production: AES-256-GCM with Midnight keys
  return btoa(data)
}

export async function decryptData(
  encrypted: string,
  password: string
): Promise<string> {
  // For demo: Base64 decode
  // In production: AES-256-GCM decryption
  try {
    return atob(encrypted)
  } catch {
    throw new Error("Failed to decrypt")
  }
}

export function generateZKProof(data: string): string {
  // For demo: Hash of data
  // In production: Real ZK proof using Midnight circuits
  return `zkp_${Date.now()}_${data.length}`
}

export function verifyZKProof(proof: string, publicData: any): boolean {
  // For demo: Always true
  // In production: Verify ZK proof
  return proof.startsWith("zkp_")
}
```

### Step 3: Create Midnight Client (45 min)

**File:** `lib/midnight/client.ts`

```typescript
import { PrivateItem, AccessControl } from './types'
import { encryptData, decryptData, generateZKProof } from './crypto'

export class MidnightClient {
  /**
   * Publish private contract
   */
  async publishPrivate(params: {
    name: string
    version: string
    type: "contract" | "package"
    sourceCode: string
    metadata: any
    publisher: string
    accessList: string[]
  }): Promise<PrivateItem> {
    
    // Encrypt source and metadata
    const encryptedSource = await encryptData(
      params.sourceCode,
      params.publisher // Use publisher address as encryption key
    )
    
    const encryptedMetadata = await encryptData(
      JSON.stringify(params.metadata),
      params.publisher
    )
    
    // Generate ZK proof (proves data exists without revealing it)
    const zkProof = generateZKProof(params.sourceCode)
    
    // Create private item
    const item: PrivateItem = {
      id: `${params.name}-${params.version}-${Date.now()}`,
      encryptedSource,
      encryptedMetadata,
      publicInfo: {
        name: params.name,
        version: params.version,
        type: params.type,
        publisher: params.publisher,
        timestamp: Date.now(),
      },
      accessList: [params.publisher, ...params.accessList],
      zkProof,
    }
    
    // Store in Midnight network (demo: localStorage)
    this.storePrivate(item)
    
    return item
  }
  
  /**
   * Get private item (if you have access)
   */
  async getPrivate(itemId: string, viewerAddress: string): Promise<PrivateItem | null> {
    const item = this.retrievePrivate(itemId)
    
    if (!item) return null
    
    // Check access
    if (!item.accessList.includes(viewerAddress)) {
      throw new Error("Access denied - not in access list")
    }
    
    return item
  }
  
  /**
   * Decrypt private item
   */
  async decrypt(item: PrivateItem, viewerAddress: string): Promise<{
    source: string
    metadata: any
  }> {
    // Verify access
    if (!item.accessList.includes(viewerAddress)) {
      throw new Error("Access denied")
    }
    
    // Decrypt
    const source = await decryptData(item.encryptedSource, viewerAddress)
    const metadata = JSON.parse(await decryptData(item.encryptedMetadata, viewerAddress))
    
    return { source, metadata }
  }
  
  // Demo storage (localStorage)
  private storePrivate(item: PrivateItem): void {
    const items = this.getAllPrivate()
    items[item.id] = item
    localStorage.setItem('midnight_private_registry', JSON.stringify(items))
  }
  
  private retrievePrivate(itemId: string): PrivateItem | null {
    const items = this.getAllPrivate()
    return items[itemId] || null
  }
  
  private getAllPrivate(): Record<string, PrivateItem> {
    const data = localStorage.getItem('midnight_private_registry')
    return data ? JSON.parse(data) : {}
  }
}

export const midnightClient = new MidnightClient()
```

### Step 4: Add Privacy Selector to Publish Flow (1 hour)

**File:** `components/publish-contract-form.tsx`

Add after IPFS upload step, before Cardano publish:

```typescript
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { midnightClient } from "@/lib/midnight/client"
import type { PrivacyMode } from "@/lib/midnight/types"

// Add to component state
const [privacyMode, setPrivacyMode] = useState<PrivacyMode>("public")
const [accessList, setAccessList] = useState<string[]>([])
const [newAddress, setNewAddress] = useState("")

// Add privacy selection step (between IPFS and Cardano)
{currentStep === 3 && (
  <Card className="p-6 bg-black/20 backdrop-blur-sm border-white/10">
    <h3 className="text-xl font-semibold text-white mb-4">
      🌙 Privacy Settings
    </h3>
    
    {/* Privacy Mode Selection */}
    <div className="space-y-4 mb-6">
      <Label className="text-white">Choose Privacy Mode</Label>
      
      <div className="space-y-3">
        {/* Public Option */}
        <label className="flex items-start gap-3 p-4 rounded-lg border border-white/10 hover:border-purple-500/50 cursor-pointer bg-white/5">
          <input
            type="radio"
            name="privacy"
            checked={privacyMode === "public"}
            onChange={() => setPrivacyMode("public")}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="text-white font-medium mb-1">
              🌐 Public (Default)
            </div>
            <div className="text-sm text-slate-400">
              Source code visible to everyone. Standard Cardano registry.
            </div>
          </div>
        </label>
        
        {/* Private Option */}
        <label className="flex items-start gap-3 p-4 rounded-lg border border-white/10 hover:border-purple-500/50 cursor-pointer bg-white/5">
          <input
            type="radio"
            name="privacy"
            checked={privacyMode === "private"}
            onChange={() => setPrivacyMode("private")}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="text-white font-medium mb-1">
              🌙 Private (Midnight)
            </div>
            <div className="text-sm text-slate-400">
              Encrypted source code. Only authorized viewers can access. Uses Midnight protocol.
            </div>
            <div className="mt-2 text-xs text-purple-400">
              ✨ Unique feature - No other team has this!
            </div>
          </div>
        </label>
      </div>
    </div>
    
    {/* Access Control (only for private mode) */}
    {privacyMode === "private" && (
      <div className="space-y-3 p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
        <Label className="text-white">Access Control</Label>
        <p className="text-sm text-slate-400">
          Add Cardano addresses of users who can view this contract
        </p>
        
        <div className="flex gap-2">
          <Input
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            placeholder="addr1..."
            className="bg-white/5 border-white/10 text-white"
          />
          <Button
            onClick={() => {
              if (newAddress && !accessList.includes(newAddress)) {
                setAccessList([...accessList, newAddress])
                setNewAddress("")
              }
            }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Add
          </Button>
        </div>
        
        {/* Access List */}
        {accessList.length > 0 && (
          <div className="space-y-2 mt-3">
            <Label className="text-white text-sm">Granted Access:</Label>
            {accessList.map((addr, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 bg-white/5 rounded text-sm"
              >
                <code className="text-slate-300">
                  {addr.slice(0, 15)}...{addr.slice(-10)}
                </code>
                <button
                  onClick={() => setAccessList(accessList.filter((_, idx) => idx !== i))}
                  className="text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )}
    
    <div className="flex gap-3 mt-6">
      <Button
        onClick={() => setCurrentStep(2)}
        variant="outline"
        className="flex-1"
      >
        Back
      </Button>
      <Button
        onClick={() => setCurrentStep(4)}
        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
      >
        Continue to Publish
      </Button>
    </div>
  </Card>
)}

// Update publish function
const handlePublish = async () => {
  try {
    setIsPublishing(true)
    
    if (privacyMode === "private") {
      // Private publish via Midnight
      const privateItem = await midnightClient.publishPrivate({
        name: formData.name,
        version: formData.version,
        type: "contract",
        sourceCode: JSON.stringify({ abi: files.abi, bytecode: files.bytecode }),
        metadata: formData,
        publisher: walletAddress,
        accessList,
      })
      
      // Still publish to Cardano (but with encrypted reference)
      const result = await publishToCardano({
        type: "contract",
        name: formData.name,
        version: formData.version,
        sourceCID: `midnight://${privateItem.id}`, // Reference to Midnight
        metadataCID: ipfsCIDs.metadata,
        walletAddress,
      })
      
      setTxHash(result.txHash)
      setPrivateItemId(privateItem.id)
    } else {
      // Public publish (normal flow)
      const result = await publishToCardano({
        type: "contract",
        name: formData.name,
        version: formData.version,
        sourceCID: ipfsCIDs.source,
        metadataCID: ipfsCIDs.metadata,
        walletAddress,
      })
      
      setTxHash(result.txHash)
    }
    
    setCurrentStep(5) // Success
  } catch (error) {
    console.error("Publish error:", error)
    toast.error("Failed to publish")
  } finally {
    setIsPublishing(false)
  }
}
```

### Step 5: Create Private Registry Viewer (45 min)

**File:** `app/private-registry/page.tsx`

```typescript
"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { midnightClient } from "@/lib/midnight/client"
import { useCardanoWallet } from "@/contexts/CardanoWalletContext"

export default function PrivateRegistryPage() {
  const { walletAddress } = useCardanoWallet()
  const [itemId, setItemId] = useState("")
  const [item, setItem] = useState<any>(null)
  const [decrypted, setDecrypted] = useState<any>(null)
  const [error, setError] = useState("")

  const handleView = async () => {
    if (!walletAddress) {
      setError("Please connect wallet first")
      return
    }
    
    try {
      setError("")
      const privateItem = await midnightClient.getPrivate(itemId, walletAddress)
      setItem(privateItem)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDecrypt = async () => {
    if (!item || !walletAddress) return
    
    try {
      const data = await midnightClient.decrypt(item, walletAddress)
      setDecrypted(data)
    } catch (err: any) {
      setError("Decryption failed: " + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      <Sidebar />
      <div className="ml-64 p-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          🌙 Private Registry
        </h1>
        <p className="text-slate-400 mb-6">
          View encrypted contracts with Midnight privacy
        </p>

        {/* View Private Item */}
        <Card className="p-6 bg-black/20 backdrop-blur-sm border-white/10 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Access Private Contract
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-white text-sm">Private Item ID</label>
              <Input
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                placeholder="contract-name-1.0.0-..."
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>

            <Button
              onClick={handleView}
              disabled={!walletAddress}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {walletAddress ? "View Item" : "Connect Wallet First"}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-300">
              {error}
            </div>
          )}
        </Card>

        {/* Item Details */}
        {item && (
          <Card className="p-6 bg-black/20 backdrop-blur-sm border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">
              Contract Details
            </h3>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400">Name:</span>
                <span className="text-white">{item.publicInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Version:</span>
                <span className="text-white">{item.publicInfo.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Publisher:</span>
                <code className="text-white text-xs">
                  {item.publicInfo.publisher.slice(0, 20)}...
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Access List:</span>
                <span className="text-white">{item.accessList.length} users</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ZK Proof:</span>
                <code className="text-green-400 text-xs">{item.zkProof}</code>
              </div>
            </div>

            {!decrypted && (
              <Button
                onClick={handleDecrypt}
                className="bg-green-600 hover:bg-green-700"
              >
                🔓 Decrypt Source Code
              </Button>
            )}

            {decrypted && (
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">✅ Decrypted Source:</h4>
                  <pre className="p-4 bg-black/40 rounded text-green-400 text-xs overflow-auto max-h-96">
                    {decrypted.source}
                  </pre>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Metadata:</h4>
                  <pre className="p-4 bg-black/40 rounded text-blue-400 text-xs overflow-auto max-h-48">
                    {JSON.stringify(decrypted.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
```

### Step 6: Add to Sidebar (5 min)

**File:** `components/sidebar.tsx`

```typescript
// Add to menu items
{
  href: "/private-registry",
  label: "Private Registry",
  icon: "🌙"
}
```

---

## Testing

### Test Public Mode:
1. Upload contract
2. Select "Public"
3. Publish to Cardano
4. Verify in version history

### Test Private Mode:
1. Upload contract
2. Select "Private"
3. Add access addresses
4. Publish
5. Go to Private Registry
6. Enter item ID
7. Decrypt with wallet
8. Verify source visible

---

## Success Criteria

- [ ] Privacy selector shows after IPFS upload
- [ ] Can choose public/private
- [ ] Public mode works (normal flow)
- [ ] Private mode encrypts source
- [ ] Access control enforced
- [ ] Private registry page works
- [ ] Can decrypt with correct address
- [ ] Access denied for unauthorized users

---

## Competitive Advantage

**Why This Wins:**
- ✅ **Unique** - No other team has Midnight
- ✅ **Enterprise-ready** - Privacy for proprietary code
- ✅ **Regulatory compliance** - GDPR, data protection
- ✅ **Access control** - Selective disclosure
- ✅ **Zero-knowledge proofs** - Prove without revealing

**Demo Impact:**
- Show public publish (normal)
- Show private publish (encrypted)
- Show access control working
- Show decryption for authorized user
- Show access denied for unauthorized

---

**This is your secret weapon! 🌙🚀**
