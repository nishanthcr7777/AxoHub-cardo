$ErrorActionPreference = "Stop"

Write-Host "Midnight Compact Compiler"
Write-Host "========================="
Write-Host ""

$contract = "contract\ownership.compact"
$output = "contract\artifacts\ownership"

# Create artifacts directory if it doesn't exist
if (-not (Test-Path "contract\artifacts")) {
    New-Item -ItemType Directory -Force -Path "contract\artifacts" | Out-Null
}

Write-Host "Compiling $contract..."
Write-Host ""

# Use the Node.js wrapper script
node scripts\compile-wrapper.js compile $contract $output

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Compilation complete!" -ForegroundColor Green
} else {
    Write-Error "Compilation failed."
    exit 1
}
