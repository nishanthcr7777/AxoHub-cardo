  # 🚀 Quick Start - Hydra Version Control (8 Hours)

## ⚡ Rapid Setup Checklist

### Prerequisites (5 min)
```bash
# Check Node.js version
node --version  # Should be 18+

# Check Docker
docker --version
```

### Hour 0: Setup (60 min)

#### 1. Install Dependencies (5 min)
```bash
npm install @monaco-editor/react monaco-editor diff lucid-cardano
npm install --save-dev @types/diff tsx
```

#### 2. Create Hydra Docker Setup (10 min)
Create `docker-compose.hydra.yml` in project root - see full plan for content

#### 3. Start Hydra (5 min)
```bash
docker-compose -f docker-compose.hydra.yml up -d
docker logs -f axohub-hydra  # Verify running
```

#### 4. Create Files (40 min)
- `lib/hydra/client.ts` - Hydra WebSocket client
- `lib/hydra/diff.ts` - Diff utilities
- `lib/hydra/utils.ts` - Helper functions
- Update `lib/cardano/types.ts` - Add HydraCommit type

### Hour 1-2: Code Editor (120 min)

#### 5. Create Components (90 min)
- `components/code-editor.tsx` - Monaco editor wrapper
- `components/commit-dialog.tsx` - Commit UI
- Update `app/version-history/page.tsx` - Add editor

#### 6. Test Editor (30 min)
```bash
npm run dev
# Open http://localhost:3000/version-history
# Verify Monaco loads and code editing works
```

### Hour 3-4: Commit Flow (120 min)

#### 7. Create API (60 min)
- `app/api/hydra/commit/route.ts` - Commit endpoint
- `app/api/hydra/commits/[packageId]/route.ts` - Query endpoint

#### 8. Test Commit (30 min)
- Edit code
- Click "Commit to Hydra"
- Verify commit stored
- Check Hydra logs

#### 9. Add History UI (30 min)
- `components/commit-history.tsx` - Timeline component
- Update page to show history

### Hour 5-6: Push to L1 (120 min)

#### 10. Create Push API (60 min)
- `app/api/hydra/push/route.ts` - Push endpoint
- Implement Hydra Head settlement
- Build Cardano transaction

#### 11. Test Push (30 min)
- Make multiple commits
- Click "Push to L1"
- Verify batch transaction

#### 12. Add Status Tracking (30 min)
- Update commit status after push
- Show L1 confirmation

### Hour 7-8: Polish & Test (120 min)

#### 13. Add Error Handling (30 min)
- Try-catch blocks
- User-friendly errors
- Fallback states

#### 14. Add Loading States (30 min)
- Commit loading
- Push loading
- History loading

#### 15. End-to-End Test (60 min)
- Full flow: Edit → Commit → Commit → Push
- Test error cases
- Verify UI/UX

---

## 📁 File Creation Order

1. **Hour 0-1:**
   - `docker-compose.hydra.yml`
   - `lib/hydra/client.ts`
   - `lib/hydra/diff.ts`
   - `lib/hydra/utils.ts`
   - Update `lib/cardano/types.ts`

2. **Hour 1-2:**
   - `components/code-editor.tsx`
   - `components/commit-dialog.tsx`
   - Update `app/version-history/page.tsx`

3. **Hour 3-4:**
   - `app/api/hydra/commit/route.ts`
   - `app/api/hydra/commits/[packageId]/route.ts`
   - `components/commit-history.tsx`

4. **Hour 5-6:**
   - `app/api/hydra/push/route.ts`
   - `app/api/hydra/status/[txHash]/route.ts`

5. **Hour 7-8:**
   - Error handling updates
   - Loading state components
   - Testing & fixes

---

## 🎯 Minimal Feature Set (8 Hours)

### ✅ Must Have
- Monaco code editor
- Commit to Hydra (instant)
- Commit history display
- Push to L1 (batch)
- Basic error handling

### ❌ Skip for Now
- Advanced diff viewer (use simple text diff)
- Multi-file support (single file only)
- Wallet signing (mock for now)
- Production Hydra setup (local Docker only)
- Comprehensive tests (basic manual testing)

---

## 🐛 Common Issues & Fixes

### Hydra Node Won't Start
```bash
# Check logs
docker logs axohub-hydra

# Restart
docker-compose -f docker-compose.hydra.yml restart

# Reset
docker-compose -f docker-compose.hydra.yml down -v
docker-compose -f docker-compose.hydra.yml up -d
```

### Monaco Editor Not Loading
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Commit Fails
```bash
# Check Hydra connection
curl http://localhost:4001/heads

# Check API logs
# Look at terminal running npm run dev
```

---

## 📊 Progress Tracker

```
Hour 0: [_] Setup Hydra Docker
Hour 1: [_] Create Hydra client
Hour 2: [_] Add Monaco editor
Hour 3: [_] Build commit dialog
Hour 4: [_] Create commit API
Hour 5: [_] Add commit history
Hour 6: [_] Create push API
Hour 7: [_] Add error handling
Hour 8: [_] Test & polish

Status: 0/8 hours complete
```

---

## 🎉 Success Criteria

After 8 hours, you should be able to:

1. ✅ Open version control page
2. ✅ Edit code in Monaco editor
3. ✅ See live diff stats
4. ✅ Click "Commit to Hydra"
5. ✅ See commit in history (< 1 sec)
6. ✅ Make more changes
7. ✅ Commit again
8. ✅ Click "Push to L1"
9. ✅ See all commits batched
10. ✅ View final version in browse page

---

## 📞 Need Help?

**Hydra Issues:**
- Check Docker logs: `docker logs axohub-hydra`
- Verify port 4001 is free: `lsof -i :4001`
- Read Hydra docs: https://hydra.family/head-protocol/

**Monaco Issues:**
- Check browser console for errors
- Verify webpack config allows Monaco
- Try clearing cache

**API Issues:**
- Check Next.js terminal for errors
- Verify API routes are created
- Test with curl/Postman first

---

**Ready? Let's build! 🚀**

Start with Hour 0 and work through sequentially. Don't skip ahead!
