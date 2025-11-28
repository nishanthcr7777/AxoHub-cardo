# 🌐 Axohub

> The decentralized **package & source registry for smart contracts** – publish, discover, and integrate verified code seamlessly.

<p align="center">
  <img width="360" height="360" alt="image" src="https://github.com/user-attachments/assets/38d12441-41c1-4f23-af43-659d48ce4e02" />
</p>


<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/status-In%20Development-yellow" /></a>
  <a href="#"><img src="https://img.shields.io/badge/license-MIT-blue.svg" /></a>
  <a href="#"><img src="https://img.shields.io/badge/deployed-Vercel-purple" /></a>
</p>  

---

## 🚧 Migration Notice

**AxoHub is currently being refactored for Cardano blockchain integration.**

All Ethereum/EVM-specific code has been removed in preparation for Cardano integration. The UI and project structure remain intact.

**Status**: EVM components removed ✅ | Cardano integration in progress 🚧

---

## 🚀 Vision

Axohub is an **open-source package & source manager for smart contracts**, functioning like **npm for blockchain development**. It enables developers and founders to:

* Publish reusable contracts and packages
* Verify source code on-chain
* Submit source code to IPFS for decentralized storage
* Browse verified contracts and sources with real-time updates

---

## ✨ Features

* 📦 **Package Publishing** – Upload compiled contracts with metadata
* 📝 **Source Submission** – Submit raw source code with IPFS storage
* 🔐 **On-chain Verification** – Trustless, transparent smart contract verification
* 🌍 **IPFS Integration** – Decentralized storage for metadata and source code
* ⚡ **Frontend Integration** – Connect contracts to apps seamlessly
* 💻 **Developer Friendly** – Intuitive UI with multi-step forms
* 🛠️ **Founder Friendly** – No complex tooling setup required

---

## 📂 Tech Stack

* **Frontend:** Next.js 14 + TailwindCSS + Framer Motion
* **UI Components:** Radix UI (accessible, unstyled primitives)
* **Forms:** React Hook Form + Zod validation
* **Storage:** IPFS via Pinata
* **Hosting:** Vercel
* **Blockchain:** *Cardano integration in progress*

---

## 🔧 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/AxoHub-BCH.git
cd AxoHub-BCH

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
npm run build
npm start
```

---

## 📦 Project Structure

```
AxoHub-BCH/
├── app/                    # Next.js 14 App Router
│   ├── browse-packages/    # Package browsing
│   ├── browse-sources/     # Source browsing
│   ├── publish-package/    # Package publishing
│   ├── submit-source/      # Source submission
│   └── profile/            # User profile
├── components/             # React components
│   ├── ui/                 # Radix UI components
│   ├── *-form.tsx          # Form components
│   └── *-table.tsx         # Table components
├── lib/                    # Utilities
│   ├── ipfs.ts             # Pinata IPFS integration
│   └── ipfs-mock.ts        # Local storage mock (for demo data)
├── hooks/                  # Custom React hooks
├── contexts/               # React contexts
└── styles/                 # Global styles
```

---

## 🛣️ Roadmap

* [x] MVP: UI and form components
* [x] IPFS mock integration
* [x] Multi-step form workflows
* [x] Responsive design
* [ ] Cardano blockchain integration
* [x] Real IPFS integration (Pinata)
* [ ] Wallet connection (Cardano wallets)
* [ ] On-chain contract registry
* [ ] Multi-chain support
* [ ] AxoHub SDK for developers
* [ ] Governance via DAO

---

## 👥 Contributors

* Nishanth B (Founder & Developer)
* Open to community contributions 🚀

---

## 📜 License

MIT License © 2025 Axohub
