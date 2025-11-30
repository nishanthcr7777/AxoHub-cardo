# IPFS Setup Instructions

## Current Status
- **Pinata IPFS** is configured and ready to use
- Requires JWT token from Pinata dashboard
- Files will be pinned to IPFS automatically

## Setup Pinata IPFS

### Step 1: Get Pinata JWT Token

1. **Sign up/Login:**
   - Visit: https://app.pinata.cloud
   - Create account or sign in

2. **Create API Key:**
   - Go to: https://app.pinata.cloud/developers/api-keys
   - Click "New Key"
   - Enable "pinFileToIPFS" and "pinJSONToIPFS" permissions
   - Copy the JWT token

### Step 2: Configure Environment

Add to `.env.local`:
```bash
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token_here
```

**Important:** 
- No quotes around the token
- No spaces before/after the `=`
- Restart dev server after adding

### Step 3: Verify Setup

1. Start dev server: `npm run dev`
2. Check console for: `✅ Using Pinata IPFS`
3. Test upload from publish forms
4. Verify files are accessible via Pinata gateway

## Alternative IPFS Services

If you need to switch to a different IPFS service, you'll need to modify `lib/ipfs.ts` to use their API. Popular alternatives include:

- **NFT.Storage**: https://nft.storage (requires JWT token)
- **Web3.Storage**: https://web3.storage (now Storacha)
- **Lighthouse**: https://files.lighthouse.storage (requires API key)

## Testing Pinata IPFS

1. Upload test files from publish forms
2. Check console for: `✅ [Pinata] File uploaded successfully`
3. Check console for CID: `CID: bafybei...`
4. Click IPFS links to verify files are accessible via Pinata gateway
5. Complete Cardano publish flow

## Troubleshooting

**If you get "JWT token not configured" error:**
- Verify `.env.local` exists in project root
- Check token format: `NEXT_PUBLIC_PINATA_JWT=your_token` (no quotes)
- Restart dev server after adding/updating `.env.local`
- Check token has correct permissions in Pinata dashboard

**If upload fails:**
- Verify JWT token is valid and not expired
- Check Pinata API key permissions include `pinFileToIPFS` and `pinJSONToIPFS`
- Check network/firewall isn't blocking `api.pinata.cloud`
- Check browser console for detailed error messages

**If files aren't accessible:**
- Wait a few seconds after upload (IPFS propagation)
- Try Pinata gateway: `https://gateway.pinata.cloud/ipfs/{cid}`
- Verify CID is correct in transaction metadata

## Pinata Features

- ✅ Automatic pinning (files stay on IPFS)
- ✅ Fast gateway access
- ✅ Free tier available (1GB storage)
- ✅ Reliable IPFS infrastructure
- ✅ CID v1 support

## Gateway URLs

- **Pinata Gateway**: `https://gateway.pinata.cloud/ipfs/{cid}`
- **Public IPFS Gateway**: `https://ipfs.io/ipfs/{cid}` (fallback)

## Questions?

Check `lib/ipfs.ts` for the Pinata implementation code.
