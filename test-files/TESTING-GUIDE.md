# Phase 1 Testing Guide

## Test Files Created

I've created sample files in `d:\downloadds\AxoHub-BCH\test-files\`:

1. **For Contract Testing:**
   - `sample-abi.json` - Sample ABI file
   - `sample-bytecode.txt` - Sample bytecode

2. **For Package Testing:**
   - `sample-package.zip` - ZIP file containing sample package

---

## Test 1: Publish Contract

### Steps:

1. **Navigate to Publish Contract**
   - Go to http://localhost:3000/publish-contract
   - Or click "Publish Contract" in sidebar

2. **Upload Files (Step 1)**
   - Click "Choose File" for ABI
   - Select: `d:\downloadds\AxoHub-BCH\test-files\sample-abi.json`
   - Click "Choose File" for Bytecode
   - Select: `d:\downloadds\AxoHub-BCH\test-files\sample-bytecode.txt`
   - Click "Continue to Metadata"

3. **Fill Metadata (Step 2)**
   - **Contract Name**: `TestContract`
   - **Version**: `1.0.0`
   - **Description**: `Test contract for AxoHub Phase 1`
   - **Compiler**: `solc 0.8.9`
   - **Author**: `Your Name`
   - Click "Upload to IPFS"

4. **IPFS Upload (Step 3)**
   - Wait for upload to complete
   - Should see success message
   - Should show IPFS CIDs

5. **Publish to Cardano (Step 4)**
   - Make sure wallet is connected (Eternl)
   - Click "Publish to Cardano Registry"
   - **Sign transaction in wallet popup**
   - Wait for confirmation

6. **Success (Step 5)**
   - Should see success page with:
     - Transaction hash (clickable)
     - Source IPFS CID (clickable)
     - Metadata IPFS CID (clickable)
   - Click links to verify they work

### Expected Results:
✅ Files upload successfully  
✅ IPFS returns valid CIDs  
✅ Transaction submits to Cardano  
✅ Links open correctly  

---

## Test 2: Publish Package

### Steps:

1. **Navigate to Publish Package**
   - Go to http://localhost:3000/publish-package
   - Or click "Publish Package" in sidebar

2. **Upload Package (Step 1)**
   - Click "Choose File"
   - Select: `d:\downloadds\AxoHub-BCH\test-files\sample-package.zip`
   - Click "Continue to Metadata"

3. **Fill Metadata (Step 2)**
   - **Package Name**: `test-package`
   - **Version**: `1.0.0`
   - **Description**: `Test package for AxoHub Phase 1`
   - **Author**: `Your Name`
   - **Repository**: `https://github.com/yourname/test-package` (optional)
   - **License**: `MIT`
   - Click "Upload to IPFS"

4. **IPFS Upload (Step 3)**
   - Wait for upload
   - Should see success with CIDs

5. **Publish to Cardano (Step 4)**
   - Click "Publish to Cardano Registry"
   - Sign transaction in wallet
   - Wait for confirmation

6. **Success (Step 5)**
   - Verify transaction hash and IPFS links

### Expected Results:
✅ ZIP uploads successfully  
✅ IPFS returns valid CIDs  
✅ Transaction submits to Cardano  
✅ Links work  

---

## Test 3: Version History

### Steps:

1. **Navigate to Version History**
   - Go to http://localhost:3000/version-history
   - Or click "Version History" in sidebar

2. **Search by Name**
   - Enter: `TestContract` in search box
   - Select: "Contracts" from type dropdown
   - Click "Search"

3. **Verify Results**
   - Should see your published contract
   - Check version number (1.0.0)
   - Check publisher address (your wallet)
   - Check timestamp
   - Click IPFS links to verify

4. **Load All Published**
   - Click "Load All Published" button
   - Should see both contract and package
   - Verify all info is correct

### Expected Results:
✅ Search finds published items  
✅ All metadata displays correctly  
✅ IPFS links work  
✅ Publisher address matches wallet  

---

## Troubleshooting

### IPFS Upload Fails
- Check Pinata API keys in `.env.local`
- Verify keys have pinning permissions
- Check browser console for errors

### Transaction Fails
- Ensure wallet has testnet ADA
- Check wallet is on Preprod network
- Verify Blockfrost API key is correct

### No Results in Version History
- Wait a few minutes for Cardano confirmation
- Check transaction on Cardano Explorer
- Verify script address in `.env.local`

---

## Success Criteria

Phase 1 is successful if:

- [x] Can upload files to IPFS
- [x] IPFS returns valid CIDs
- [x] Can sign and submit Cardano transaction
- [x] Transaction appears on Cardano Explorer
- [x] Version history displays published items
- [x] All links work correctly

---

## Next Steps After Testing

Once all tests pass:
1. Take screenshots for documentation
2. Note any issues or improvements
3. Ready to start Phase 2 (Aiken Validator)

**Good luck with testing!** 🚀
