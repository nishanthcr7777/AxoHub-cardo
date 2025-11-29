# PowerShell script to download Cardano Preprod config files

Write-Host "📥 Downloading Cardano Preprod configuration files..." -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path "cardano-config" | Out-Null

# Download configuration files for Preprod testnet
Write-Host "Downloading configuration.yaml..." -ForegroundColor Yellow
Invoke-WebRequest -Uri "https://book.world.dev.cardano.org/environments/preprod/config.json" `
  -OutFile "cardano-config/configuration.yaml"

Write-Host "Downloading topology.json..." -ForegroundColor Yellow
Invoke-WebRequest -Uri "https://book.world.dev.cardano.org/environments/preprod/topology.json" `
  -OutFile "cardano-config/topology.json"

Write-Host "✅ Configuration files downloaded to cardano-config/" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Files:" -ForegroundColor Cyan
Write-Host "   - cardano-config/configuration.yaml" -ForegroundColor Gray
Write-Host "   - cardano-config/topology.json" -ForegroundColor Gray

