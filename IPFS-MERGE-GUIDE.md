# Merging Teammate's IPFS Integration

## Current Status
Your teammate has completed real IPFS integration with Pinata and created a branch.

## Steps to Merge

### 1. Find the Branch Name
First, we need to know what branch your teammate created. Ask them or check:
```bash
git fetch --all
git branch -r
```

### 2. Review Their Changes (Recommended)
Before merging, checkout their branch to test:
```bash
git fetch origin
git checkout feature/ipfs-branch-name
npm install  # In case they added dependencies
npm run dev  # Test it works
```

### 3. Test IPFS Integration
- Try publishing a contract
- Verify real IPFS upload works
- Check CIDs are valid
- Test IPFS links

### 4. Merge to Main
If everything works:
```bash
git checkout main
git merge feature/ipfs-branch-name
git push origin main
```

### 5. Update .env.local
Make sure you have Pinata credentials:
```
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token
```

## What to Check

### In `lib/ipfs.ts`:
- [ ] Real Pinata API calls (not mock)
- [ ] Proper error handling
- [ ] Valid CID generation

### In `.env.local`:
- [ ] Pinata JWT token configured
- [ ] No mock mode flags

### Test Flow:
1. Upload contract files
2. See "Uploading to IPFS..." message
3. Get real IPFS CID (starts with `Qm` or `bafy`)
4. Click IPFS link - should open file
5. Publish to Cardano
6. Browse page shows item with working IPFS links

## Potential Issues

### If Merge Conflicts:
```bash
git merge feature/branch-name
# Fix conflicts in files
git add .
git commit -m "Merged IPFS integration"
```

### If Tests Fail:
- Check Pinata API key is valid
- Verify network connectivity
- Check console for errors

## Next Steps After Merge

1. ✅ Test full publish flow
2. ✅ Verify IPFS links work
3. ✅ Update documentation
4. ✅ Ready for Midnight integration (Teammate 2)

---

**Tell me the branch name and I'll help you merge it!**
