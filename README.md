# Stellar Pay

Stellar Pay is a small payment dApp built for the Rise In Stellar Journey to Mastery White Belt challenge. It runs on Stellar Testnet and demonstrates wallet connection, balance reading, and an XLM payment flow.

## What it demonstrates

- Connect and disconnect a Freighter wallet
- Use the Stellar Testnet network
- Read and display the connected account's XLM balance
- Send an XLM payment to another Stellar address
- Show transaction success or failure feedback
- Link the confirmed transaction to Stellar Expert

## Run locally

Requirements: Node.js 18+, a Chromium browser, and the [Freighter wallet](https://www.freighter.app/) extension.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. In Freighter, switch to **Testnet** and fund the account using the [Stellar Laboratory Friendbot](https://laboratory.stellar.org/#account-creator?network=test).

## How the transaction works

1. The app loads the account from Horizon Testnet.
2. It builds a native XLM payment operation with the current account sequence number.
3. Freighter signs the transaction locally.
4. The signed transaction is submitted to Horizon Testnet.
5. The returned transaction hash is shown with a Stellar Expert link.

## Stack

React, TypeScript, Vite, `@stellar/stellar-sdk`, `@stellar/freighter-api`, Horizon Testnet.

## Screenshots

The current UI preview is in [`docs/screenshots/app-overview.png`](docs/screenshots/app-overview.png). Wallet-connected, balance, and confirmed-transaction screenshots should be captured after running the app with a funded Freighter testnet account.

## Safety

This project uses Stellar Testnet only. Never enter a seed phrase or private key into the app. Testnet assets have no monetary value.
