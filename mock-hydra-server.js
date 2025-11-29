const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 5001 });

const mockCommits = [];
let headInitialized = false;

wss.on('connection', (ws) => {
  console.log('✅ Client connected to mock Hydra');
  
  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message);
      console.log('📨 Received:', msg.tag);
      
      if (msg.tag === 'Init') {
        headInitialized = true;
        ws.send(JSON.stringify({
          tag: 'HeadIsInitialized',
          headId: 'mock-head-123',
          timestamp: Date.now()
        }));
        console.log('✅ Head initialized');
      }
      
      if (msg.tag === 'NewTx') {
        const commitData = {
          id: `commit-${mockCommits.length + 1}`,
          data: msg.transaction?.data || msg.transaction,
          timestamp: Date.now()
        };
        mockCommits.push(commitData);
        ws.send(JSON.stringify({
          tag: 'TxValid',
          transaction: msg.transaction,
          commitId: commitData.id
        }));
        console.log(`✅ Transaction committed: ${commitData.id}`);
      }
      
      if (msg.tag === 'GetUTxO') {
        const utxo = {};
        mockCommits.forEach((commit, i) => {
          utxo[`utxo-${i}`] = {
            datum: {
              type: 'commit',
              data: commit.data,
              id: commit.id
            },
            value: {
              lovelace: 1000000
            }
          };
        });
        
        ws.send(JSON.stringify({
          tag: 'SnapshotConfirmed',
          snapshot: {
            utxo: utxo,
            timestamp: Date.now()
          }
        }));
        console.log(`✅ UTxO snapshot sent: ${mockCommits.length} commits`);
      }
      
      if (msg.tag === 'GetStatus') {
        ws.send(JSON.stringify({
          tag: 'Status',
          headInitialized: headInitialized,
          commitCount: mockCommits.length,
          headId: headInitialized ? 'mock-head-123' : null
        }));
      }
      
    } catch (error) {
      console.error('❌ Error processing message:', error);
      ws.send(JSON.stringify({
        tag: 'Error',
        message: error.message
      }));
    }
  });
  
  ws.on('close', () => {
    console.log('👋 Client disconnected');
  });
  
  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });
  
  // Send welcome message
  ws.send(JSON.stringify({
    tag: 'Connected',
    message: 'Mock Hydra server ready',
    endpoints: {
      api: 'http://localhost:4001',
      websocket: 'ws://localhost:5001'
    }
  }));
});

console.log('🚀 Mock Hydra server running on ws://localhost:5001');
console.log('📝 Supports: Init, NewTx, GetUTxO, GetStatus');


