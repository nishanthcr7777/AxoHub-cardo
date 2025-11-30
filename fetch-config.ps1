$baseUrl = "https://book-of-cardano.github.io/environments/preprod"
$configDir = "cardano-config"

# List of files to download
$files = @(
    "config.json",
    "topology.json",
    "byron-genesis.json",
    "shelley-genesis.json",
    "alonzo-genesis.json",
    "conway-genesis.json"
)

Write-Host "📥 Downloading Cardano Preprod configurations..."

foreach ($file in $files) {
    $url = "$baseUrl/$file"
    $output = "$configDir/$file"
    Write-Host "Downloading $file..."
    Invoke-WebRequest -Uri $url -OutFile $output
}

Write-Host "✅ Configuration files downloaded to $configDir"
