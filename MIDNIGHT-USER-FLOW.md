# Midnight Privacy - Complete User Flow

## 🔐 How Authorized Access Works

---

## User Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    PUBLISHER FLOW                            │
└─────────────────────────────────────────────────────────────┘

1. Upload Contract
   ↓
2. Fill Metadata
   ↓
3. IPFS Upload (mock CID)
   ↓
4. 🌙 PRIVACY CHOICE
   ├─ Public → Normal Cardano publish
   └─ Private → Continue below
       ↓
5. Add Authorized Addresses
   - Enter Cardano addresses
   - addr1qx...abc (Viewer 1)
   - addr1qy...def (Viewer 2)
   - addr1qz...ghi (Viewer 3)
   ↓
6. Encrypt & Publish
   - Source encrypted with publisher's key
   - Stored in Midnight (localStorage for demo)
   - Metadata published to Cardano
   - ZK Proof generated
   ↓
7. Get Private Item ID
   - Example: "MyContract-1.0.0-1732695123456"
   - Share this ID with authorized users


┌─────────────────────────────────────────────────────────────┐
│                    VIEWER FLOW                               │
└─────────────────────────────────────────────────────────────┘

1. Receive Private Item ID
   - Publisher shares: "MyContract-1.0.0-1732695123456"
   ↓
2. Go to Private Registry Page
   - Navigate to /private-registry
   ↓
3. Connect Wallet
   - Connect with Eternl/Nami/Lace
   - Wallet address: addr1qx...abc
   ↓
4. Enter Item ID
   - Paste: "MyContract-1.0.0-1732695123456"
   - Click "View Item"
   ↓
5. Access Check
   ├─ ✅ Address in access list → Show item details
   └─ ❌ Address NOT in list → "Access Denied"
       ↓
6. View Public Metadata
   - Name: MyContract
   - Version: 1.0.0
   - Publisher: addr1...xyz
   - Access List: 3 users
   - ZK Proof: ✅ Verified
   ↓
7. Decrypt Source
   - Click "Decrypt Source Code"
   - Uses wallet address as decryption key
   - Shows full source code
```

---

## Detailed Step-by-Step

### Publisher Side:

**Step 1: Publish Private Contract**

```typescript
// User fills form
name: "MyContract"
version: "1.0.0"
description: "Private smart contract"

// Uploads files
abi.json
bytecode.txt

// Gets IPFS CID (mock)
ipfs://bafybeiabc123...

// Chooses privacy mode
Privacy: Private (Midnight)

// Adds authorized viewers
Access List:
  - addr1qx5h8...abc (Alice)
  - addr1qy7k9...def (Bob)  
  - addr1qz2m3...ghi (Charlie)

// Publishes
→ Source encrypted
→ Stored in Midnight
→ Metadata to Cardano
→ Gets Private Item ID: "MyContract-1.0.0-1732695123456"
```

**Step 2: Share with Authorized Users**

Publisher sends to Alice, Bob, Charlie:
```
📧 Email / 💬 Chat / 📱 Message:

"I've published a private contract on AxoHub!

Private Item ID: MyContract-1.0.0-1732695123456

You can view it at:
https://axohub.io/private-registry

Your address (addr1qx5h8...abc) has been granted access.
"
```

---

### Viewer Side (Alice):

**Step 1: Receive Notification**

Alice gets message with Private Item ID

**Step 2: Go to Private Registry**

```
Navigate to: https://axohub.io/private-registry
```

**Step 3: Connect Wallet**

```
Click "Connect Wallet"
→ Eternl wallet opens
→ Alice approves connection
→ Wallet address: addr1qx5h8...abc
```

**Step 4: Enter Item ID**

```
Input Field: "MyContract-1.0.0-1732695123456"
Click: "View Item"
```

**Step 5: Access Verification**

```javascript
// System checks:
const item = await midnightClient.getPrivate(itemId, aliceAddress)

// Check access list
if (item.accessList.includes(aliceAddress)) {
  // ✅ GRANTED
  showItemDetails()
} else {
  // ❌ DENIED
  showError("Access Denied - You are not authorized")
}
```

**Step 6: View Public Info**

Alice sees:
```
┌─────────────────────────────────┐
│ Contract Details                │
├─────────────────────────────────┤
│ Name: MyContract                │
│ Version: 1.0.0                  │
│ Type: Contract                  │
│ Publisher: addr1...xyz          │
│ Access List: 3 users            │
│ ZK Proof: ✅ Verified           │
│                                 │
│ [Decrypt Source Code] 🔓        │
└─────────────────────────────────┘
```

**Step 7: Decrypt Source**

```
Alice clicks "Decrypt Source Code"
→ System uses Alice's wallet address as key
→ Decrypts encrypted source
→ Shows full source code
```

Result:
```
┌─────────────────────────────────┐
│ ✅ Decrypted Source Code        │
├─────────────────────────────────┤
│ pragma solidity ^0.8.0;         │
│                                 │
│ contract MyContract {           │
│   uint256 public value;         │
│                                 │
│   function setValue(uint256 _v) │
│   public {                      │
│     value = _v;                 │
│   }                             │
│ }                               │
└─────────────────────────────────┘
```

---

### Unauthorized User (Dave):

**Dave tries to access:**

```
Dave's address: addr1qw9p4...xyz (NOT in access list)

1. Dave enters Item ID
2. Connects wallet
3. Clicks "View Item"
4. System checks access list
5. ❌ addr1qw9p4...xyz NOT found
6. Shows error:

┌─────────────────────────────────┐
│ ❌ Access Denied                │
├─────────────────────────────────┤
│ You are not authorized to view  │
│ this private contract.          │
│                                 │
│ Contact the publisher to        │
│ request access.                 │
└─────────────────────────────────┘
```

---

## Access Control Matrix

| User | Address | In Access List? | Can View Metadata? | Can Decrypt? |
|------|---------|-----------------|-------------------|--------------|
| Publisher | addr1...xyz | ✅ (owner) | ✅ Yes | ✅ Yes |
| Alice | addr1qx5h8...abc | ✅ Yes | ✅ Yes | ✅ Yes |
| Bob | addr1qy7k9...def | ✅ Yes | ✅ Yes | ✅ Yes |
| Charlie | addr1qz2m3...ghi | ✅ Yes | ✅ Yes | ✅ Yes |
| Dave | addr1qw9p4...xyz | ❌ No | ❌ No | ❌ No |

---

## How Encryption/Decryption Works

### Encryption (Publisher):

```typescript
// When publishing
const sourceCode = `contract MyContract { ... }`

// Encrypt with publisher's address
const encrypted = await encryptData(
  sourceCode,
  publisherAddress // "addr1...xyz"
)

// Store encrypted data
{
  encryptedData: "YmFzZTY0ZW5jb2RlZA==",
  accessList: [
    "addr1qx5h8...abc", // Alice
    "addr1qy7k9...def", // Bob
    "addr1qz2m3...ghi"  // Charlie
  ]
}
```

### Decryption (Viewer):

```typescript
// When Alice views
const viewerAddress = "addr1qx5h8...abc"

// Check access
if (item.accessList.includes(viewerAddress)) {
  // Decrypt using viewer's address
  const decrypted = await decryptData(
    item.encryptedData,
    viewerAddress
  )
  
  // Show source code
  display(decrypted)
}
```

---

## Granting Additional Access

### Publisher can add more users later:

```typescript
// Publisher grants access to Eve
await midnightClient.grantAccess(
  itemId: "MyContract-1.0.0-1732695123456",
  viewerKey: "addr1qe4r5...jkl", // Eve's address
  ownerKey: publisherAddress
)

// Now Eve can access too
```

**UI for this:**

```
┌─────────────────────────────────┐
│ Manage Access                   │
├─────────────────────────────────┤
│ Current Access List (3):        │
│ • addr1qx5h8...abc (Alice)      │
│ • addr1qy7k9...def (Bob)        │
│ • addr1qz2m3...ghi (Charlie)    │
│                                 │
│ Add New User:                   │
│ [addr1qe4r5...jkl] [Grant] ✅   │
└─────────────────────────────────┘
```

---

## Security Features

### 1. **Access Control**
- Only addresses in access list can view
- Publisher controls who has access
- Can add/remove users anytime

### 2. **Encryption**
- Source code encrypted before storage
- Only authorized users can decrypt
- Uses wallet address as key

### 3. **Zero-Knowledge Proof**
- Proves contract exists
- Proves publisher identity
- Doesn't reveal source code

### 4. **Audit Trail**
- All access attempts logged
- Publisher can see who viewed
- Timestamp of each access

---

## Demo Script

**For Hackathon Presentation:**

1. **Show Public Publish** (30 sec)
   - "This is normal publish - everyone sees it"

2. **Show Private Publish** (1 min)
   - "Now watch - I choose Private mode"
   - "Add authorized addresses"
   - "Source is encrypted"
   - "Only metadata on Cardano"

3. **Show Authorized Access** (1 min)
   - "Alice connects wallet"
   - "Enters Private Item ID"
   - "✅ Access granted"
   - "Decrypts source code"

4. **Show Denied Access** (30 sec)
   - "Dave tries to access"
   - "❌ Access denied"
   - "Not in access list"

5. **Highlight Uniqueness** (30 sec)
   - "No other team has this!"
   - "Enterprise privacy"
   - "Regulatory compliance"
   - "Midnight protocol"

---

## Use Cases

### 1. **Proprietary Contracts**
- Company publishes internal contracts
- Only employees can view
- Competitors can't see source

### 2. **Security Audits**
- Publish for audit
- Only auditors have access
- Public can verify it was audited (ZK proof)

### 3. **Regulatory Compliance**
- GDPR compliance
- Data protection
- Selective disclosure

### 4. **Bug Bounties**
- Publish encrypted
- Grant access to security researchers
- Control who sees vulnerabilities

---

**This is your competitive advantage! 🌙🏆**
