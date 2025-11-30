# Vercel Host Setup Guide for AxoHub-BCH

This guide outlines the steps to deploy the AxoHub-BCH application to Vercel.

## Prerequisites

1.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
2.  **GitHub Repository**: Ensure your project is pushed to a GitHub repository.
3.  **Hydra Node**: You must have a publicly accessible Hydra node (WebSocket URL).
4.  **Blockfrost Project**: A Blockfrost API key for the Cardano Preprod network.

## 1. Prepare Your Project

Ensure your `package.json` has the correct build scripts (Next.js default):

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

## 2. Deploy to Vercel

1.  **Log in to Vercel** and go to your **Dashboard**.
2.  Click **"Add New..."** -> **"Project"**.
3.  **Import Git Repository**: Select your `AxoHub-BCH` repository.
4.  **Configure Project**:
    *   **Framework Preset**: Next.js (should be auto-detected).
    *   **Root Directory**: `./` (default).
    *   **Build Command**: `npm run build` or `next build`.
    *   **Output Directory**: `.next` (default).

## 3. Environment Variables

You **MUST** configure the following environment variables in the Vercel Project Settings.

Go to **Settings** -> **Environment Variables** and add:

| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_BLOCKFROST_API_KEY` | Blockfrost API Key (Preprod) | `preprod...` |
| `NEXT_PUBLIC_CARDANO_NETWORK` | Network Name | `Preprod` |
| `NEXT_PUBLIC_HYDRA_WS_URL` | Public WebSocket URL for Hydra | `wss://hydra.your-domain.com` |
| `NEXT_PUBLIC_LIGHTHOUSE_API_KEY` | Lighthouse Storage API Key | `your-lighthouse-key` |
| `NEXT_PUBLIC_PINATA_JWT` | Pinata JWT for IPFS | `eyJ...` |
| `NEXT_PUBLIC_REGISTRY_SCRIPT_ADDRESS` | AxoHub Registry Contract Address | `addr_test1...` |
| `NEXT_PUBLIC_ENABLE_REAL_ZK_PROOFS` | Enable ZK Proofs (Optional) | `true` |
| `NEXT_PUBLIC_MIDNIGHT_PROOF_SERVER_URL` | ZK Proof Server URL (Optional) | `https://zk.your-domain.com` |

> **Important**: The `NEXT_PUBLIC_HYDRA_WS_URL` must be a **Secure WebSocket (wss://)** endpoint accessible from the public internet. If you are running a local Hydra node, it will NOT work on Vercel unless you expose it via a tunnel (e.g., ngrok) or host it on a VPS with SSL.

## 4. WASM Configuration (Critical)

This project uses `lucid-cardano` which relies on WebAssembly (WASM). Vercel's default build environment usually handles this, but if you encounter WASM errors:

1.  Ensure your `next.config.mjs` includes WASM support (already configured in this project).
2.  If you see "Module not found" errors for WASM, verify that `lucid-cardano` is properly installed in `dependencies`.

## 5. Deploy

Click **Deploy**. Vercel will build your application and assign a default domain (e.g., `axohub-bch.vercel.app`).

## Troubleshooting

### WebSocket Connection Failed
*   **Cause**: The browser cannot connect to your Hydra node.
*   **Fix**: Ensure `NEXT_PUBLIC_HYDRA_WS_URL` is correct and uses `wss://` (Secure WebSocket). Mixed content (https app connecting to ws://) is blocked by most browsers.

### Blockfrost Error / Transaction Builder Failed
*   **Cause**: Missing or invalid Blockfrost API key.
*   **Fix**: Check `NEXT_PUBLIC_BLOCKFROST_API_KEY` in Vercel Environment Variables.

### 404 on Refresh
*   **Cause**: Client-side routing issue.
*   **Fix**: Next.js on Vercel handles this automatically. If using a custom server, ensure rewrites are configured.

### WASM Errors
*   **Fix**: Ensure you are using the correct version of `lucid-cardano`.
