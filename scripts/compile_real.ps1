$ErrorActionPreference = "Stop"

Write-Host "🌑 Midnight Compact Compiler (Real Mode)"
Write-Host "========================================"

# Define paths one by one to avoid syntax issues
$p1 = "..\my-midnight-app\node_modules\.bin\compact.cmd"
$p2 = "..\my-midnight-app\node_modules\.bin\compact.ps1"
$p3 = "C:\Users\nevan\Downloads\my-midnight-app\node_modules\.bin\compact.cmd"

$compiler = $null

if (Test-Path $p1) { $compiler = $p1 }
elseif (Test-Path $p2) { $compiler = $p2 }
elseif (Test-Path $p3) { $compiler = $p3 }

if ($null -eq $compiler) {
    Write-Error "❌ Could not find 'compact' compiler in my-midnight-app."
    exit 1
}

Write-Host "✅ Found compiler at: $compiler"

$contract = "contract\ownership.compact"
$output = "contract\artifacts\ownership"

Write-Host "📦 Compiling $contract..."

# Run the compiler
& $compiler compile $contract $output

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Compilation successful!"
} else {
    Write-Error "❌ Compilation failed."
    exit 1
}
