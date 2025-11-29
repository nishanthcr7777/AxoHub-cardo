#!/bin/bash

set -e

echo "📥 Downloading Cardano Preprod configuration files..."

mkdir -p cardano-config

# Download configuration files for Preprod testnet
curl -o cardano-config/configuration.yaml \
  https://book.world.dev.cardano.org/environments/preprod/config.json

curl -o cardano-config/topology.json \
  https://book.world.dev.cardano.org/environments/preprod/topology.json

echo "✅ Configuration files downloaded to cardano-config/"
echo ""
echo "📝 Files:"
echo "   - cardano-config/configuration.yaml"
echo "   - cardano-config/topology.json"


