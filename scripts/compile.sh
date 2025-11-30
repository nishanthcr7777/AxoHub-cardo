#!/bin/bash

# Midnight Compact Contract Compilation Script
# This script compiles .compact contracts to WASM and circuit artifacts

set -e

echo "🌑 Midnight Compact Compiler"
echo "=============================="

# Check if compactc is installed
if ! command -v compactc &> /dev/null; then
    echo "❌ Error: compactc not found"
    echo ""
    echo "Please install the Midnight Compact compiler:"
    echo "  npm install -g @midnight-ntwrk/compact-cli"
    echo ""
    echo "Or download from: https://github.com/midnight-ntwrk/devnet-releases"
    exit 1
fi

echo "✅ Compact compiler found: $(compactc --version)"
echo ""

# Create artifacts directory
mkdir -p contract/artifacts

# Compile ownership.compact
echo "📦 Compiling ownership.compact..."
compactc compile \
    --input contract/ownership.compact \
    --output contract/artifacts/ownership.wasm \
    --circuit-output contract/artifacts/ownership-circuit.json \
    --metadata-output contract/artifacts/ownership-metadata.json

if [ $? -eq 0 ]; then
    echo "✅ Compilation successful!"
    echo ""
    echo "Generated artifacts:"
    ls -lh contract/artifacts/
    echo ""
    echo "🎉 Ready to generate ZK proofs!"
else
    echo "❌ Compilation failed"
    exit 1
fi
