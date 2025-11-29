 # Hydra Docker Setup - Complete Guide

## ✅ Correct Docker Image Found

**Official Image**: `ghcr.io/cardano-scaling/hydra-node:latest`
- **Source**: GitHub Container Registry (GHCR)
- **Organization**: cardano-scaling
- **Version**: 1.2.0 (latest)

## 📦 Updated Docker Compose

The `docker-compose.hydra.yml` has been updated with a complete setup including Cardano node and Hydra node.

**See [HYDRA-DOCKER-QUICKSTART.md](./HYDRA-DOCKER-QUICKSTART.md) for detailed setup instructions.**

## ⚠️ Current Challenge

The Hydra node requires a **Cardano node connection** to function properly. The current configuration is missing:
- Cardano node socket path
- Network magic number
- Ledger genesis files
- Hydra signing keys

## 🎯 Options for Testing

### Option 1: Mock Hydra Server (Recommended for Development)

Create a simple mock WebSocket server that simulates Hydra responses for UI testing:

```javascript
// mock-hydra-server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 5001 });

const mockCommits = [];

wss.on('connection', (ws) => {
  console.log('Client connected to mock Hydra');
  
  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    
    if (msg.tag === 'Init') {
      ws.send(JSON.stringify({
        tag: 'HeadIsInitialized',
        headId: 'mock-head-123'
      }));
    }
    
    if (msg.tag === 'NewTx') {
      mockCommits.push(msg.transaction.data);
      ws.send(JSON.stringify({
        tag: 'TxValid',
        transaction: msg.transaction
      }));
    }
    
    if (msg.tag === 'GetUTxO') {
      ws.send(JSON.stringify({
        tag: 'SnapshotConfirmed',
        snapshot: {
          utxo: mockCommits.map((commit, i) => ({
            [`utxo-${i}`]: {
              datum: {
                type: 'commit',
                data: commit
              }
            }
          }))
        }
      }));
    }
  });
});

console.log('Mock Hydra server running on ws://localhost:5001');
```

**Run**: `node mock-hydra-server.js`

### Option 2: Full Hydra Setup (Production)

For a complete Hydra setup, you need:

1. **Cardano Node** running on Preprod/Preview
2. **Hydra Node** configuration files
3. **Signing keys** for Hydra participants

**Complete docker-compose.yml**:

```yaml
version: '3.8'

services:
  cardano-node:
    image: ghcr.io/intersectmbo/cardano-node:latest
    container_name: cardano-node
    volumes:
      - cardano-node-data:/data
      - cardano-node-ipc:/ipc
    environment:
      - NETWORK=preprod
    ports:
      - "3001:3001"
    command: run

  hydra-node:
    image: ghcr.io/cardano-scaling/hydra-node:latest
    container_name: axohub-hydra
    depends_on:
      - cardano-node
    volumes:
      - ./hydra-keys:/keys
      - cardano-node-ipc:/ipc
    ports:
      - "4001:4001"
      - "5001:5001"
    command: >
      --node-id 1
      --api-host 0.0.0.0
      --api-port 4001
      --host 0.0.0.0
      --port 5001
      --peer localhost:5002
      --hydra-signing-key /keys/hydra.sk
      --cardano-signing-key /keys/cardano.sk
      --ledger-protocol-parameters /keys/protocol-parameters.json
      --testnet-magic 1
      --node-socket /ipc/node.socket

volumes:
  cardano-node-data:
  cardano-node-ipc:
```

### Option 3: Test UI Without Hydra (Immediate)

The application gracefully handles Hydra connection failures. You can:

1. Start the Next.js application
2. Test the UI components
3. Commits will fail but you can verify the interface

```bash
npm install
npm run dev
```

Visit: `http://localhost:3000/version-history`

## 🚀 Quick Start Commands

### Full Docker Setup (Recommended)

```bash
# Windows
.\hydra-setup.ps1
docker compose -f docker-compose.hydra.yml up -d

# Linux/Mac
chmod +x hydra-setup.sh
./hydra-setup.sh
docker compose -f docker-compose.hydra.yml up -d
```

### Mock Server (Development)

```bash
# Install dependencies
npm install ws

# Run mock server
node mock-hydra-server.js

# In another terminal, start app
npm run dev
```

### UI Testing Only

```bash
npm run dev
# Visit http://localhost:3000/version-history
```

**For complete setup instructions, see [HYDRA-DOCKER-QUICKSTART.md](./HYDRA-DOCKER-QUICKSTART.md)**

## 📚 Resources

- **Hydra Documentation**: https://hydra.family/head-protocol/
- **GitHub Repository**: https://github.com/cardano-scaling/hydra
- **Docker Image**: https://github.com/cardano-scaling/hydra/pkgs/container/hydra-node
- **Hydra Tutorial**: https://hydra.family/head-protocol/docs/tutorial/

## ✅ What's Working

- ✅ Correct Docker image identified and pulled
- ✅ Docker compose file updated
- ✅ All Hydra client code implemented
- ✅ UI components ready
- ✅ API routes configured

## ⏭️ Next Steps

1. **Choose testing approach** (mock server recommended)
2. **Start the application** to test UI
3. **Implement mock Hydra server** for full flow testing
4. **Set up full Cardano + Hydra** for production (later)
