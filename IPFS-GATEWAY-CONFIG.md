# IPFS Gateway Configuration

## Problem
Some networks/firewalls block IPFS gateway domains, causing SSL certificate errors or connection failures.

## Solution
The gateway is now **configurable** via environment variable!

## How to Configure

### Option 1: Use Pinata Gateway (Default)
No configuration needed - uses Pinata's gateway by default.

### Option 2: Use Different Gateway
Add to `.env.local`:
```bash
# Choose one:

# Public IPFS gateway
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/

# Cloudflare IPFS
NEXT_PUBLIC_IPFS_GATEWAY=https://cloudflare-ipfs.com/ipfs/

# Dweb.link
NEXT_PUBLIC_IPFS_GATEWAY=https://dweb.link/ipfs/

# IPFS.tech
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.tech/ipfs/

# Or keep Pinata (default)
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

### Option 3: No Gateway (Just Show CID)
If all gateways are blocked, you can:

1. **Show CID only** - Users can access via their own IPFS node
2. **View in Pinata Dashboard** - https://app.pinata.cloud/pinmanager
3. **Use IPFS Desktop** - Download from https://ipfs.tech/#install

## Alternative: View Files in Pinata Dashboard

Since gateways might be blocked, you can always view your uploaded files at:
**https://app.pinata.cloud/pinmanager**

This shows:
- All uploaded files
- CIDs
- File sizes
- Upload dates
- Direct download links

## For Hackathon Demo

If you're demoing and gateways are blocked:

1. **Show the CID** - Proves file is on IPFS
2. **Show Pinata Dashboard** - Shows real uploads
3. **Explain IPFS** - Files are on decentralized network
4. **Alternative access** - Anyone with IPFS can access

## Testing Different Gateways

Try these in order until one works:

```bash
# Test 1: Pinata (default)
https://gateway.pinata.cloud/ipfs/YOUR_CID

# Test 2: IPFS.io
https://ipfs.io/ipfs/YOUR_CID

# Test 3: Cloudflare
https://cloudflare-ipfs.com/ipfs/YOUR_CID

# Test 4: Dweb
https://dweb.link/ipfs/YOUR_CID
```

Replace `YOUR_CID` with actual CID like `bafkreidolhgzwrz...`

## Summary

✅ **Upload:** Always works (Pinata API)
✅ **Storage:** Files on IPFS network
⚠️ **Access:** Depends on network/firewall
✅ **Proof:** Pinata dashboard shows all files

**Bottom line:** Files ARE uploaded to IPFS, gateway access is just a network issue.
