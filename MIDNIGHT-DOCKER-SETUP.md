# Midnight Docker Setup Guide

## Overview
This guide explains how to set up the Midnight proof server using Docker and compile Compact contracts for real ZK proof generation.

## Prerequisites
- ✅ Docker Desktop installed and running
- ✅ Node.js 18+ installed
- ✅ Midnight Compact compiler (`compactc`)

## Installation Steps

### 1. Install Midnight Compact Compiler

**Option A: Using npm (recommended)**
```bash
npm install -g @midnight-ntwrk/compact-cli
```

**Option B: Download from GitHub**
```bash
# Download from https://github.com/midnight-ntwrk/devnet-releases
# Extract and add to PATH
```

Verify installation:
```bash
compactc --version
```

### 2. Start Midnight Proof Server

Start the Docker proof server:
```bash
docker-compose -f docker-compose.midnight.yml up -d
```

Check if it's running:
```bash
docker ps | grep midnight
curl http://localhost:8080/health
```

### 3. Compile Compact Contract

**On Windows (PowerShell):**
```powershell
.\scripts\compile.ps1
```

**On Linux/Mac:**
```bash
chmod +x scripts/compile.sh
./scripts/compile.sh
```

This will generate:
- `contract/artifacts/ownership.wasm` - Compiled circuit
- `contract/artifacts/ownership-circuit.json` - Circuit definition
- `contract/artifacts/ownership-metadata.json` - Contract metadata

### 4. Enable Real ZK Proofs

Update `.env.local`:
```bash
NEXT_PUBLIC_ENABLE_REAL_ZK_PROOFS=true
NEXT_PUBLIC_ENABLE_DEMO_MODE=false
NEXT_PUBLIC_MIDNIGHT_PROOF_SERVER_URL=http://localhost:8080
```

Restart the dev server:
```bash
npm run dev
```

## Testing

### 1. Test Proof Server
```bash
curl http://localhost:8080/health
```

Expected response:
```json
{"status": "healthy", "version": "1.0.0"}
```

### 2. Test Proof Generation

1. Navigate to `http://localhost:3000/zk-demo`
2. Click "🌑 ZK Verify Access Key (Midnight)"
3. Enter an NFT ID (or use `demo.test1`)
4. Click "Generate ZK Proof"

Check browser console for:
```
🌑 Midnight Client initialized in REAL mode
   Proof Server: http://localhost:8080
🔧 Initializing Midnight client...
📦 Loading circuit artifacts...
✅ Circuit artifacts loaded
✅ Proof server is healthy
✅ Midnight client initialized
🔗 Connecting to Midnight proof server...
✅ Real Midnight proof generated successfully
```

## Modes

### Demo Mode (Default)
- `NEXT_PUBLIC_ENABLE_DEMO_MODE=true`
- `NEXT_PUBLIC_ENABLE_REAL_ZK_PROOFS=false`
- Uses mock NFT data
- Simulates proof generation
- No Docker required

### Real Mode
- `NEXT_PUBLIC_ENABLE_DEMO_MODE=false`
- `NEXT_PUBLIC_ENABLE_REAL_ZK_PROOFS=true`
- Requires Docker proof server
- Requires compiled WASM artifacts
- Generates real ZK proofs

### Hybrid Mode
- `NEXT_PUBLIC_ENABLE_DEMO_MODE=true`
- `NEXT_PUBLIC_ENABLE_REAL_ZK_PROOFS=true`
- Uses demo NFTs but real proof generation
- Best for development

## Troubleshooting

### Proof server not starting
```bash
# Check Docker logs
docker logs axohub-midnight-proof

# Restart the service
docker-compose -f docker-compose.midnight.yml restart
```

### Compilation fails
```bash
# Check if compactc is installed
compactc --version

# Install if missing
npm install -g @midnight-ntwrk/compact-cli
```

### WASM artifacts not loading
- Ensure artifacts are in `contract/artifacts/`
- Check file permissions
- Verify compilation completed successfully

### Proof generation timeout
- Increase timeout in `midnight-client.ts`
- Check proof server logs
- Verify circuit artifacts are valid

## Docker Commands

```bash
# Start services
docker-compose -f docker-compose.midnight.yml up -d

# Stop services
docker-compose -f docker-compose.midnight.yml down

# View logs
docker logs -f axohub-midnight-proof

# Restart services
docker-compose -f docker-compose.midnight.yml restart

# Remove volumes
docker-compose -f docker-compose.midnight.yml down -v
```

## Architecture

```
┌─────────────────┐
│   Next.js App   │
│  (Browser/API)  │
└────────┬────────┘
         │
         ├─ WASM Loader
         │  └─ Loads compiled artifacts
         │
         ├─ Midnight Client
         │  ├─ Demo Mode: Simulated proofs
         │  └─ Real Mode: Proof server
         │
         ▼
┌─────────────────┐
│  Proof Server   │
│    (Docker)     │
│   Port: 8080    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Circuit WASM    │
│   Artifacts     │
└─────────────────┘
```

## Next Steps

1. ✅ Install Compact compiler
2. ✅ Start Docker proof server
3. ✅ Compile contract
4. ✅ Enable real proofs
5. ✅ Test proof generation

For more information, see:
- [Midnight Documentation](https://docs.midnight.network)
- [Compact Language Guide](https://compact-by-example.org)
