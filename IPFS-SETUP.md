# IPFS Setup Instructions for Teammate

## Current Status
- **Mock IPFS** is currently active (network restrictions)
- Generates realistic CIDs for demo
- Cardano transactions work perfectly
- Files not actually uploaded to IPFS

## To Switch to Real IPFS

### Option 1: Lighthouse (Recommended)

1. **Get API Key:**
   - Visit: https://files.lighthouse.storage
   - Sign up (free)
   - Copy your API key

2. **Update Environment:**
   ```bash
   # Add to .env.local
   NEXT_PUBLIC_LIGHTHOUSE_API_KEY=your_lighthouse_api_key_here
   ```

3. **Switch Files:**
   ```bash
   # Backup current mock
   mv lib/ipfs.ts lib/ipfs-mock-backup.ts
   
   # Use real IPFS
   mv lib/ipfs-real.ts lib/ipfs.ts
   ```

4. **Restart:**
   ```bash
   npm run dev
   ```

### Option 2: Try Other Services

If Lighthouse doesn't work on your network, try:

- **NFT.Storage**: https://nft.storage (requires JWT token)
- **Web3.Storage**: https://web3.storage (now Storacha)
- **Pinata**: https://pinata.cloud (requires JWT token)

## Testing Real IPFS

1. Upload test files from `test-files/`
2. Check console for: `✅ File uploaded to IPFS: QmXXX...`
3. Click IPFS links to verify files are accessible
4. Complete Cardano publish flow

## Troubleshooting

**If you get network errors:**
- Check firewall settings
- Try different network (mobile hotspot)
- Disable VPN
- Check antivirus isn't blocking API calls

**If API key errors:**
- Verify key is correct (no extra spaces)
- Check `.env.local` format (no quotes)
- Restart dev server after changes

## Current Mock IPFS

The mock version:
- ✅ Works offline
- ✅ Generates realistic CIDs
- ✅ Allows full UI testing
- ✅ Cardano transactions work
- ❌ Files not actually stored
- ❌ IPFS links won't work

Perfect for:
- Demo/presentation
- Testing Cardano flow
- Development without network access

## Questions?

Check `lib/ipfs-real.ts` for the real implementation code.
