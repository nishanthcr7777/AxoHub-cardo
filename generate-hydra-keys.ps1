# PowerShell script to generate Hydra keys and fetch protocol parameters

Write-Host "Generating Hydra keys and configuration..." -ForegroundColor Cyan

# Create directories
New-Item -ItemType Directory -Force -Path "hydra-keys" | Out-Null

# Check if Cardano node is running
$cardanoRunning = docker ps --filter "name=axohub-cardano-node" --format "{{.Names}}" | Select-String "axohub-cardano-node"

if (-not $cardanoRunning) {
    Write-Host "WARNING: Cardano node is not running." -ForegroundColor Yellow
    Write-Host "Starting Cardano node..." -ForegroundColor Yellow
    docker compose -f docker-compose.hydra.yml up -d cardano-node
    Write-Host "Waiting for Cardano node to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

# Fetch protocol parameters from Cardano node
Write-Host "Fetching protocol parameters..." -ForegroundColor Yellow
try {
    docker exec axohub-cardano-node cardano-cli query protocol-parameters `
        --testnet-magic 1 `
        --socket-path /ipc/node.socket `
        --out-file /tmp/protocol-parameters.json
    
    docker cp axohub-cardano-node:/tmp/protocol-parameters.json hydra-keys/protocol-parameters.json
    
    if (Test-Path "hydra-keys/protocol-parameters.json") {
        Write-Host "SUCCESS: Protocol parameters saved to hydra-keys/protocol-parameters.json" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Failed to fetch protocol parameters" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR: Could not fetch protocol parameters. Make sure Cardano node is fully synced." -ForegroundColor Red
    Write-Host "You can manually fetch them later with:" -ForegroundColor Yellow
    Write-Host "  docker exec axohub-cardano-node cardano-cli query protocol-parameters --testnet-magic 1 --socket-path /ipc/node.socket --out-file /tmp/protocol-parameters.json" -ForegroundColor Gray
    Write-Host "  docker cp axohub-cardano-node:/tmp/protocol-parameters.json hydra-keys/protocol-parameters.json" -ForegroundColor Gray
}

# Generate Cardano signing key
if (-not (Test-Path "hydra-keys/cardano.sk")) {
    Write-Host ""
    Write-Host "Generating Cardano signing key..." -ForegroundColor Yellow
    try {
        docker exec axohub-cardano-node cardano-cli address key-gen `
            --verification-key-file /tmp/cardano.vkey `
            --signing-key-file /tmp/cardano.sk
        
        docker cp axohub-cardano-node:/tmp/cardano.sk hydra-keys/cardano.sk
        docker cp axohub-cardano-node:/tmp/cardano.vkey hydra-keys/cardano.vkey
        
        if (Test-Path "hydra-keys/cardano.sk") {
            Write-Host "SUCCESS: Cardano signing key generated" -ForegroundColor Green
        }
    } catch {
        Write-Host "ERROR: Could not generate Cardano keys. You may need to install cardano-cli locally." -ForegroundColor Red
        Write-Host "Alternative: Use the Hydra demo setup to generate all keys:" -ForegroundColor Yellow
        Write-Host "  git clone https://github.com/cardano-scaling/hydra.git" -ForegroundColor Gray
        Write-Host "  cd hydra/demo" -ForegroundColor Gray
        Write-Host "  ./prepare-devnet.sh" -ForegroundColor Gray
    }
}

# Instructions for Hydra signing key
if (-not (Test-Path "hydra-keys/hydra.sk")) {
    Write-Host ""
    Write-Host "WARNING: Hydra signing key not found." -ForegroundColor Yellow
    Write-Host "To generate Hydra keys, use the official Hydra demo setup:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  git clone https://github.com/cardano-scaling/hydra.git" -ForegroundColor Gray
    Write-Host "  cd hydra/demo" -ForegroundColor Gray
    Write-Host "  ./prepare-devnet.sh" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Then copy the generated keys from hydra/demo/credentials/ to hydra-keys/" -ForegroundColor Gray
    Write-Host ""
    Write-Host "For development/testing, you can use the mock server instead:" -ForegroundColor Yellow
    Write-Host "  npm install ws" -ForegroundColor Gray
    Write-Host "  node mock-hydra-server.js" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Protocol parameters: $(if (Test-Path 'hydra-keys/protocol-parameters.json') { 'OK' } else { 'MISSING' })" -ForegroundColor $(if (Test-Path 'hydra-keys/protocol-parameters.json') { 'Green' } else { 'Yellow' })
Write-Host "  Cardano signing key: $(if (Test-Path 'hydra-keys/cardano.sk') { 'OK' } else { 'MISSING' })" -ForegroundColor $(if (Test-Path 'hydra-keys/cardano.sk') { 'Green' } else { 'Yellow' })
Write-Host "  Hydra signing key: $(if (Test-Path 'hydra-keys/hydra.sk') { 'OK' } else { 'MISSING' })" -ForegroundColor $(if (Test-Path 'hydra-keys/hydra.sk') { 'Green' } else { 'Yellow' })

if ((Test-Path 'hydra-keys/protocol-parameters.json') -and (Test-Path 'hydra-keys/cardano.sk') -and (Test-Path 'hydra-keys/hydra.sk')) {
    Write-Host ""
    Write-Host "All keys are ready! You can start Hydra:" -ForegroundColor Green
    Write-Host "  docker compose -f docker-compose.hydra.yml up -d hydra-node" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "Some keys are missing. Hydra node will not start until all keys are present." -ForegroundColor Yellow
}

