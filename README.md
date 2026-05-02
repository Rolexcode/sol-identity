# SolIdentity

> On-chain identity and trust scoring for Solana wallets and .sol domains

**Live Demo:** https://sol-identity.vercel.app
**Track:** SNS Identity Track — Colosseum Frontier Hackathon

---

## What is SolIdentity?

SolIdentity turns any Solana wallet address or .sol domain into a rich, verifiable identity profile.

When a user connects their wallet or a developer calls `getIdentity()`, SolIdentity fetches real on-chain data and returns a structured identity object including their .sol domain, social records, trust score, and wallet history.

Think of it as "Login with Google" — but for Solana. Trust is derived entirely from on-chain activity. No centralized identity provider. No KYC. Just verifiable on-chain history.

---

## Live Demo

Visit https://sol-identity.vercel.app

- Search any .sol domain (try: `bonfida.sol`)
- Paste any Solana wallet address
- Connect your Phantom wallet
- See your on-chain identity and trust score instantly

---

## SDK Usage

SolIdentity is built as a reusable SDK. Drop it into any Solana dApp:

### Get full identity profile
```js
import { getIdentity } from './sdk'

const identity = await getIdentity("wallet.sol")
// or
const identity = await getIdentity("9oFYps...gjTv")

console.log(identity)
// {
//   walletAddress: "9oFYps...",
//   domain: "wallet.sol",
//   records: { twitter: "...", url: "..." },
//   trustScore: { score: 72, level: "High Trust", breakdown: {...} },
//   stats: { balance: 2.4, transactionCount: 450, accountAge: 820 }
// }
```

### Quick trust check — gate features by score
```js
import { getTrustScore } from './sdk'

const { score, level } = await getTrustScore(walletAddress)

if (score < 40) {
  return "Access denied — low trust wallet"
}
```

### Resolve a .sol domain
```js
import { resolveDomain } from './sdk'

const result = await resolveDomain("bonfida.sol")
// { walletAddress: "...", records: { twitter: "...", url: "..." } }
```

---

## Trust Score Breakdown

| Signal | Max Points | Logic |
|--------|-----------|-------|
| .sol Domain | 30 | Verified SNS ownership — strongest identity signal |
| Wallet Age | 25 | Older wallets are less likely to be sybil accounts |
| Transactions | 25 | More on-chain activity = more real usage |
| SOL Balance | 20 | Skin in the game |

**Score Levels:**
- 75-100 — High Trust
- 50-74 — Medium Trust
- 25-49 — Low Trust
- 0-24 — Very Low Trust

---

## How It Uses SNS

SolIdentity is built on top of the Solana Name Service (SNS) by Bonfida:

- `.sol domain resolution` — resolves any .sol domain to its wallet address
- `Reverse lookup` — finds the primary .sol domain for any connected wallet
- `Profile records` — fetches Twitter, website, and social records attached to .sol domains

Owning a .sol domain is the single biggest trust signal in our scoring system (+30 points), directly reflecting SNS as the core identity layer for Solana.

---

## Use Cases

**For dApp developers:**
- Replace raw wallet addresses with named, scored identities at login
- Gate airdrops, features, or DAO votes by minimum trust score
- Display reputation scores in community dashboards

**For users:**
- Understand your on-chain reputation
- See exactly how protocols will score your wallet
- Search and verify any .sol domain instantly

---

## Tech Stack

- React + Vite
- @solana/web3.js
- @bonfida/spl-name-service
- Solana Wallet Adapter (Phantom)
- Deployed on Vercel

---

## Running Locally

```bash
git clone https://github.com/Rolexcode/sol-identity
cd sol-identity
npm install
```

Create `.env` in root:
```
VITE_RPC_URL=your_solana_mainnet_rpc_url
```

```bash
npm run dev
```

---

## Known Limitations

- Wallet age is calculated from up to 1000 transactions (20 pages). Wallets with higher counts may show slightly younger age. Full indexer-based pagination is planned.
- Reverse lookup returns primary .sol domain only. Multi-domain support via indexer is a planned enhancement.

---

## Built For

SNS Identity Track — Colosseum Frontier Hackathon
Powered by SNS · Superteam MY · MagicBlock
