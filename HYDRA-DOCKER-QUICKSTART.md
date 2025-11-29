# Hydra Docker Quick Start Guide

## Prerequisites

- Docker and Docker Compose installed
- At least 8GB RAM available
- 50GB+ free disk space (for Cardano node data)

## Initial Setup

### Step 1: Download Cardano Configuration Files

```bash
# Windows PowerShell
.\download-cardano-config.ps1

# Linux/Mac
chmod +x download-cardano-config.sh
./download-cardano-config.sh
```

This downloads the Preprod testnet configuration files needed for the Cardano node.

## Quick Start (3 Options)

### Option 1: Full Setup with Cardano Node (Recommended for Production)

This runs both Cardano node and Hydra node together.

```bash
# Step 1: Download Cardano config files
# Windows PowerShell
.\download-cardano-config.ps1

# Linux/Mac
chmod +x download-cardano-config.sh
./download-cardano-config.sh

# Step 2: Run setup script
# Windows PowerShell
.\hydra-setup.ps1

# Linux/Mac
chmod +x hydra-setup.sh
./hydra-setup.sh

# Step 3: Start services
docker compose -f docker-compose.hydra.yml up -d

# Check status
docker compose -f docker-compose.hydra.yml ps

# View logs
docker compose -f docker-compose.hydra.yml logs -f hydra-node
```

### Option 2: Hydra Only (Requires External Cardano Node)

If you have a Cardano node running elsewhere, modify `docker-compose.hydra.yml` to point to it:

```yaml
hydra-node:
  # ... other config ...
  volumes:
    - ./hydra-keys:/keys
    - /path/to/external/node.socket:/ipc/node.socket:ro
```

### Option 3: Mock Hydra Server (Development/Testing)

For UI testing without full Hydra setup:

```bash
# Install dependencies
npm install ws

# Run mock server
node mock-hydra-server.js
```

## Required Keys & Configuration

### Quick Setup (Automated)

```bash
# Windows PowerShell
.\generate-hydra-keys.ps1

# This script will:
# - Generate Cardano signing keys
# - Fetch protocol parameters from Blockfrost
# - Provide instructions for Hydra keys
```

### Manual Setup

#### Generate Hydra Keys

```bash
# Clone Hydra repository
git clone https://github.com/cardano-scaling/hydra.git
cd hydra/demo

# Prepare devnet (generates keys)
./prepare-devnet.sh

# Copy keys to your project
cp demo/credentials/*.sk ../AxoHub-cardo/hydra-keys/
```

#### Generate Cardano Keys

```bash
# Using Docker (if Cardano node is running)
docker exec axohub-cardano-node cardano-cli address key-gen \
  --verification-key-file /tmp/cardano.vkey \
  --signing-key-file /tmp/cardano.sk

docker cp axohub-cardano-node:/tmp/cardano.sk hydra-keys/cardano.sk
docker cp axohub-cardano-node:/tmp/cardano.vkey hydra-keys/cardano.vkey
```

#### Fetch Protocol Parameters

**IMPORTANT**: Protocol parameters must be fetched from the Cardano node after it's fully synced to Shelley era. Blockfrost API format is incompatible with Hydra.

```bash
# Wait for Cardano node to fully sync (check logs: docker compose -f docker-compose.hydra.yml logs cardano-node)
# Then fetch protocol parameters:

docker exec axohub-cardano-node cardano-cli query protocol-parameters \
  --testnet-magic 1 \
  --socket-path /ipc/node.socket \
  --out-file /tmp/protocol-parameters.json

docker cp axohub-cardano-node:/tmp/protocol-parameters.json hydra-keys/protocol-parameters.json

# Fix encoding (remove BOM, convert to Unix line endings)
# On Windows PowerShell:
$content = Get-Content hydra-keys/protocol-parameters.json -Raw
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("$PWD\hydra-keys\protocol-parameters.json", $content.Replace("`r`n", "`n"), $utf8NoBom)
```

## Service Endpoints

Once running:

- **Hydra API**: http://localhost:4001
- **Hydra WebSocket**: ws://localhost:5001
- **Cardano Node**: localhost:3001

## Health Checks

```bash
# Check Hydra API
curl http://localhost:4001/health

# Check Cardano node socket
docker exec axohub-cardano-node test -S /ipc/node.socket && echo "Cardano node ready"

# Check Hydra logs
docker logs axohub-hydra
```

## Troubleshooting

### Cardano Node Not Syncing

```bash
# Check node logs
docker compose -f docker-compose.hydra.yml logs cardano-node

# Verify network configuration
docker exec axohub-cardano-node cat /config/configuration.yaml | grep -i network
```

### Hydra Node Can't Connect to Cardano

```bash
# Verify socket exists
docker exec axohub-cardano-node ls -la /ipc/node.socket

# Check shared volume
docker compose -f docker-compose.hydra.yml exec hydra-node ls -la /ipc/
```

### Missing Keys Error

Ensure all required keys exist:
- `hydra-keys/hydra.sk`
- `hydra-keys/cardano.sk`
- `hydra-keys/protocol-parameters.json`

### Port Conflicts

If ports 3001, 4001, or 5001 are in use:

```yaml
# Edit docker-compose.hydra.yml
ports:
  - "3002:3001"  # Change host port
  - "4002:4001"
  - "5002:5001"
```

## Stopping Services

```bash
# Stop all services
docker compose -f docker-compose.hydra.yml down

# Stop and remove volumes (deletes Cardano node data)
docker compose -f docker-compose.hydra.yml down -v
```

## Next Steps

1. **Wait for Cardano node sync** (first time: 10-30 minutes)
2. **Verify Hydra connection**: Check logs for successful connection
3. **Test API**: `curl http://localhost:4001/health`
4. **Connect from app**: Update `.env.local` with Hydra endpoints

## Resources

- [Hydra Documentation](https://hydra.family/head-protocol/)
- [Hydra GitHub](https://github.com/cardano-scaling/hydra)
- [Cardano Node Docs](https://developers.cardano.org/docs/get-started/running-cardano)

