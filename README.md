# AxoHub-BCH 🚀
> **The Future of Decentralized Version Control on Cardano**

![Status](https://img.shields.io/badge/Status-Beta-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Network](https://img.shields.io/badge/Network-Cardano%20Preprod-purple)
![Hydra](https://img.shields.io/badge/L2-Hydra%20Head-orange)
![ZK](https://img.shields.io/badge/Privacy-zkSNARKs-black)

**AxoHub-BCH** is a revolutionary, decentralized code collaboration platform built on the **Cardano** blockchain. It leverages **Hydra Heads** for instant, zero-fee code commits and **Zero-Knowledge Proofs (zk-SNARKs)** for privacy-preserving ownership verification.

Think of it as **"Git on Blockchain"**—but faster, cheaper, and private.

---

## 🌍 Why AxoHub is a Game Changer for Cardano

### 1. Cardano has no developer hub — AxoHub becomes the “GitHub of Cardano.”
Today, Cardano developers store code on centralized GitHub, private Google Drive, or scattered repos with no on-chain verification and no Cardano-native package manager.

**AxoHub fixes the biggest missing piece:**
👉 A true decentralized developer infrastructure built natively on Cardano.
Just like npm changed JavaScript, AxoHub changes Cardano development forever.

### 2. Cardano smart contracts (Plutus/Aiken) have NO package registry today
No library discovery, version registry, dependency installer, on-chain commit history, or reproducible builds.

**AxoHub introduces:**
*   📦 On-chain package registry (Plutus + Aiken)
*   🔢 On-chain version tracking
*   🔍 Searchable smart contract libraries
*   🧾 Metadata + source verification

This dramatically lowers the entry barrier for new devs, which is EXACTLY what Cardano Foundation wants.

### 3. Hydra integration unlocks a first-ever use case: High-frequency L2 commits
Hydra is a powerful L2, but real-world applications are scarce. AxoHub becomes the first real-world Hydra use-case:
*   Developers commit code in Hydra
*   Zero fees & Millisecond latency
*   Batch settlement to L1
*   Full audit trail preserved

This finally answers: 👉 “What can Hydra actually be used for?” AxoHub demonstrates the answer publicly.

### 4. Privacy is the biggest gap in Cardano — AxoHub finally adds it
Cardano has no private repositories, encrypted storage pipeline, or ZK tool for developer identity.

**AxoHub introduces:**
*   🔐 AES-256 encrypted code submissions
*   🔑 NFT-based private access keys
*   🕵️ Anonymous contributor proofs (ZK)
*   🔍 Verifiable validity of private packages

This makes Cardano the first chain with private, verifiable code collaboration, something even Ethereum doesn’t have today.

### 5. Aligns perfectly with Cardano’s Web3 & Midnight Future
AxoHub fits the ecosystem's 2025 vision:
*   **Midnight** → privacy
*   **Hydra** → scaling
*   **Aiken** → modern smart contract development
*   **Open-source reputation** → identity

AxoHub brings all of these into ONE product. No other project hits all strategic pillars.

### 6. Massive ecosystem impact — every Cardano dApp will eventually need AxoHub
Wallets, DEXs, Lending protocols, NFT projects, DAO tooling, GameFi apps, and Hydra apps ALL need:
*   Contract registry
*   Version control
*   Dependency resolution
*   Access control
*   Developer verification

AxoHub becomes the base layer for every future Cardano developer, similar to npm (JS), crates.io (Rust), PyPI (Python), or Go Modules.

### 7. Long-term network effect: AxoHub becomes THE identity layer for Cardano developers
Features like ZK author proofs, NFT developer badges, reputation systems, and verified contract authorship create an unstoppable network effect.

Developers will join because:
👉 Their reputation is on-chain
👉 Their packages are searchable
👉 Their commits are verified

Cardano desperately needs a developer identity system. **AxoHub provides it.**

---

## 🌟 Key Features

### 1. 📦 Submit & Manage Code
*   **Submit Package**: Upload reusable libraries (Aiken, Plutus, TypeScript) to the registry.
*   **Submit Contract**: Deploy compiled smart contracts with verification proofs.
*   **Submit Source**: Push raw source code linked to specific on-chain versions.

### 2. 🔍 Browse & Discover
*   **Browse Source**: Explore the decentralized registry. View syntax-highlighted code directly in the browser.
*   **Browse Contracts**: Verify contract addresses, datums, and redeemers against their source code.

### 3. 🛡️ Privacy Modes
*   **Public Mode**: Fully transparent. Everyone can see the code and the contributor's address. Ideal for open source.
*   **Private Mode**: Code is encrypted before storage. Only whitelisted addresses can decrypt.
*   **ZK-Proof Mode (Zero-Knowledge)**:
    *   Prove you are the author of a repository **without revealing your wallet address**.
    *   Uses **Circom** circuits to generate a zk-SNARK proof of ownership.
    *   Allows for anonymous contributions to sensitive projects (e.g., privacy tools, DAOs).

### 4. ⚡ Hydra L2 Scaling
Experience the speed of centralized git with the security of Cardano.
*   **Instant Commits**: Code changes are committed to a Hydra Head in milliseconds.
*   **Zero Fees**: No gas fees for commits within the open Head.
*   **L1 Settlement**: Batch-push your entire commit history to Cardano L1 for permanent, immutable storage.

---

## 🏗️ Architecture

AxoHub employs a **Hybrid L1/L2 Architecture** to maximize performance and security.

```mermaid
graph TD
    User[Developer] -->|1. Deposit UTXO| L1[Cardano L1]
    L1 -->|2. Open Head| Hydra[Hydra Head (L2)]
    User -->|3. Instant Commits (NewTx)| Hydra
    User -->|4. ZK Proof (Ownership)| Verifier[ZK Verifier]
    Hydra -->|5. Batch Settle| L1
    L1 -->|6. Permanent Storage| IPFS[IPFS / Arweave]
```

1.  **Hydra Client**: A custom WebSocket client (`lib/hydra/client.ts`) manages the complex state machine of Hydra Heads (Idle -> Initializing -> Open -> Closed).
2.  **Smart Contracts**: Plutus V2 validators ensure secure governance and settlement.
3.  **Circuit Logic**: `ownership.circom` defines the constraints for proving ownership of a repository asset.

---

## 🛠️ Tech Stack

*   **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Sonner
*   **Blockchain**: Cardano (Preprod), Lucid (Transaction Building)
*   **Scaling**: Hydra Node (Isomorphic State Channels)
*   **Privacy**: Circom, SnarkJS (Groth16 Proofs)
*   **Storage**: IPFS (Pinata/Lighthouse)

---

## 🚀 Getting Started

### Prerequisites
*   Node.js v18+
*   Cardano Wallet (Nami, Eternl, etc.)
*   Hydra Node (Local or Remote)

### Installation

1.  **Clone the repo**
    ```bash
    git clone https://github.com/nishanthcr7777/AxoHub-cardo.git
    cd AxoHub-cardo
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create `.env.local` with the following variables. **All are required.**

    ```env
    # Blockfrost API Key (Preprod Network)
    # Get one at https://blockfrost.io
    NEXT_PUBLIC_BLOCKFROST_API_KEY=preprod...

    # Cardano Network (Preprod or Mainnet)
    NEXT_PUBLIC_CARDANO_NETWORK=Preprod

    # Hydra Node WebSocket URL
    # Must be a Secure WebSocket (wss://) for Vercel deployment
    NEXT_PUBLIC_HYDRA_WS_URL=wss://f9807ef0f9a65447.hexcore.io.vn

    # IPFS Configuration (Pinata)
    # Get keys at https://pinata.cloud
    NEXT_PUBLIC_PINATA_JWT=eyJ...

    # Lighthouse Storage (Optional Backup)
    NEXT_PUBLIC_LIGHTHOUSE_API_KEY=...

    # Smart Contract Registry Address
    NEXT_PUBLIC_REGISTRY_SCRIPT_ADDRESS=addr_test1...

    # ZK Proof Configuration
    NEXT_PUBLIC_ENABLE_REAL_ZK_PROOFS=true
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

---

## 🛡️ Security & Privacy

We take security seriously.
*   **Non-Custodial**: You always retain control of your keys and assets.
*   **Auditable**: All smart contracts and circuits are open source.
*   **ZK-Powered**: Your contribution rights are verified mathematically, not just by signature.



**Built with ❤️ by the AxoHub Team**
*Pushing the boundaries of what's possible on Cardano.*
