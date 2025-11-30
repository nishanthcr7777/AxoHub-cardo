# Phase 2: Aiken Validator - Installation & Setup Guide

## Quick Start (For Hackathon)

**Option 1: Use Mock Mode (Fastest)**
- Phase 1 already works
- No Aiken installation needed
- Perfect for demo

**Option 2: Install Aiken (Production)**
- Follow steps below
- Compile and deploy validator
- Full production setup

---

## Installing Aiken

### Windows (PowerShell as Admin):

```powershell
# Method 1: Official installer
iwr https://install.aiken-lang.org -useb | iex

# Method 2: Via Cargo (if Rust installed)
cargo install aiken

# Verify
aiken --version
```

### Linux/Mac:

```bash
curl --proto '=https' --tlsv1.2 -LsSf https://install.aiken-lang.org | sh
```

---

## Build Validator

```bash
cd validators
aiken build
```

**Output:**
- `plutus.json` - Compiled validator
- Script address printed to console

---

## Configuration

### Phase 1 Mode (Current - No Validator):

```bash
# .env.local
NEXT_PUBLIC_USE_AIKEN_VALIDATOR=false
NEXT_PUBLIC_REGISTRY_SCRIPT_ADDRESS=addr_test1wzn9efv2f6w82hagxqtn62ju4m293tqvw0uhmdl64ch8uwc0h43gt
```

### Phase 2 Mode (With Aiken Validator):

```bash
# .env.local
NEXT_PUBLIC_USE_AIKEN_VALIDATOR=true
NEXT_PUBLIC_REGISTRY_SCRIPT_ADDRESS=<from_aiken_build>
NEXT_PUBLIC_REGISTRY_POLICY_ID=<from_nft_policy>
NEXT_PUBLIC_REFERENCE_SCRIPT_UTXO=<optional>
```

---

## Deployment (Optional)

If you want to deploy your own validator:

1. **Build:**
   ```bash
   cd validators
   aiken build
   ```

2. **Get Script Address:**
   - Shown in build output
   - Or calculate from script hash

3. **Deploy Reference Script** (Optional):
   - See `validators/DEPLOYMENT.md`
   - Requires Cardano CLI

4. **Update .env.local**

---

## Testing

```bash
# Test Aiken validator
cd validators
aiken check

# Test publishing (Phase 1 mode)
# - Upload files
# - Publish to Cardano
# - Verify transaction

# Test publishing (Phase 2 mode)
# - Same as above
# - Validator enforces rules
# - Invalid publishes rejected
```

---

## Validator Features

### Phase 1 (Current):
- ✅ Publishes to Cardano
- ✅ Stores datum
- ❌ No validation

### Phase 2 (With Aiken):
- ✅ Validates publisher signature
- ✅ Validates semantic versioning
- ✅ Validates IPFS CID format
- ✅ Prevents duplicate publishes (NFT)
- ✅ Enforces timestamp rules
- ✅ Update/Deprecate actions

---

## For Hackathon Demo

**Recommended:** Keep Phase 1 mode for now
- Already working
- No setup needed
- Focus on other features

**Upgrade to Phase 2 later:**
- After hackathon
- When you have time
- For production deployment

---

## Files Created

```
validators/
├── aiken.toml                    # Aiken config
├── lib/
│   ├── registry.ak              # Main validator
│   └── registry_nft.ak          # NFT minting policy
├── plutus.json                  # Compiled (after build)
└── DEPLOYMENT.md                # Deployment guide

lib/cardano/
├── publish-v2.ts                # Phase 2 publish logic
└── types.ts                     # Updated with redeemers
```

---

## Next Steps

1. **For Demo:** Keep using Phase 1 mode
2. **For Production:** Install Aiken and build
3. **After Hackathon:** Deploy validator to Preprod

**Phase 2 is ready but optional for hackathon!**
