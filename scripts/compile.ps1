$ErrorActionPreference = "Stop"

Write-Host "Midnight Compact Compiler"
Write-Host "========================="

# Define possible compiler paths
$paths = @(
    "..\my-midnight-app\node_modules\.bin\compact.cmd",
    "..\my-midnight-app\node_modules\.bin\compact.ps1",
    "C:\Users\nevan\Downloads\my-midnight-app\node_modules\.bin\compact.cmd"
)

$compiler = $null

foreach ($path in $paths) {
    if (Test-Path $path) {
        $compiler = $pathn
        break
    }
}

if ($null -eq $compiler) {
    Write-Error "Could not find 'compact' compiler."
    Write-Host "Please ensure 'my-midnight-app' exists in the Downloads folder."
    exit 1
}

Write-Host "Found compiler: $compiler"

$contract = "contract\ownership.compact"
$output = "contract\artifacts\ownership"

# Create artifacts directory if it doesn't exist
if (-not (Test-Path "contract\artifacts")) {
    New-Item -ItemType Directory -Force -Path "contract\artifacts" | Out-Null
}

Write-Host "Compiling $contract..."

# Execute compiler
& $compiler compile $contract $output

if ($LASTEXITCODE -eq 0) {
    Write-Host "Compilation successful!"
    Write-Host "   - WASM: $output.wasm"
    Write-Host "   - Circuit: $output-circuit.json"
} else {
    Write-Error "Compilation failed."
    exit 1
}
