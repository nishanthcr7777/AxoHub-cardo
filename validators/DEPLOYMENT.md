# Aiken Validator Deployment Guide

## Prerequisites

1. **Install Aiken:**
   ```bash
   # On Windows (PowerShell as Admin):
   iwr https://install.aiken-lang.org -useb | iex
   
   # Or via cargo:
   cargo install aiken
   
   # Verify installation:
   aiken --version
   ```

2. **Install Cardano CLI** (for deployment):
   ```bash
   # Download from: https://github.com/IntersectMBO/cardano-node/releases
   ```

## Build Validator

```bash
cd validators
aiken build
```

This generates:
- `plutus.json` - Compiled validator
- Script hash and address

## Deploy to Preprod

### Step 1: Create Reference Script UTxO

```bash
# Set network
export CARDANO_NODE_SOCKET_PATH=/path/to/preprod/node.socket

# Build reference script transaction
cardano-cli transaction build \
  --tx-in <YOUR_UTXO> \
  --tx-out <YOUR_ADDRESS>+5000000 \
  --tx-out-reference-script-file plutus.json \
  --change-address <YOUR_ADDRESS> \
  --testnet-magic 1 \
  --out-file ref-script.tx

# Sign
cardano-cli transaction sign \
  --tx-body-file ref-script.tx \
  --signing-key-file payment.skey \
  --testnet-magic 1 \
  --out-file ref-script.signed

# Submit
cardano-cli transaction submit \
  --tx-file ref-script.signed \
  --testnet-magic 1
```

### Step 2: Get Script Address

```bash
# From plutus.json, extract script hash
# Script address format: addr_test1w<script_hash>
```

### Step 3: Update Environment

Add to `.env.local`:
```bash
NEXT_PUBLIC_REGISTRY_SCRIPT_ADDRESS=addr_test1w...
NEXT_PUBLIC_REGISTRY_POLICY_ID=...
NEXT_PUBLIC_REFERENCE_SCRIPT_UTXO=<txhash>#<index>
```

## Alternative: Use Provided Deployed Validator

If you don't want to deploy yourself, use our pre-deployed validator:

```bash
# Add to .env.local
NEXT_PUBLIC_REGISTRY_SCRIPT_ADDRESS=addr_test1wzn9efv2f6w82hagxqtn62ju4m293tqvw0uhmdl64ch8uwc0h43gt
NEXT_PUBLIC_REGISTRY_POLICY_ID=<will_be_provided>
NEXT_PUBLIC_REFERENCE_SCRIPT_UTXO=<will_be_provided>
```

## Testing

```bash
# Run Aiken tests
cd validators
aiken check

# Expected output:
# ✓ All tests passed
```

## Troubleshooting

**Aiken not found:**
- Ensure PATH includes Aiken binary
- Restart terminal after installation

**Build fails:**
- Check aiken.toml syntax
- Verify stdlib version

**Deployment fails:**
- Ensure wallet has testnet ADA
- Check node socket path
- Verify network magic (1 for preprod)

## Next Steps

After deployment:
1. Update `.env.local` with script address
2. Restart dev server
3. Test publishing with validator
4. Verify validation rules work
