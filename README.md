# SolIdentity

**The identity and trust layer for Solana.**

SolIdentity turns any Solana wallet address or .sol domain into a verifiable identity profile — complete with a trust score, on-chain history, social records, and an agent registry for AI agents operating on Solana.

> Think of it as "Login with Google" — but decentralized, permissionless, and powered entirely by on-chain data.

**Live Demo:** https://sol-identity.vercel.app
**npm Package:** https://npmjs.com/package/sol-identity
**Track:** SNS Identity Track — Colosseum Frontier Hackathon

---

## The Problem

Solana has wallets. It does not have identity.

Today, every Solana dApp sees this when a user connects:
8xK2mPqR...3nQr

Just an address. No name. No history. No way to know if this is a real user, a bot, or a sybil wallet created 5 minutes ago.

This creates real problems across the ecosystem:

- Airdrops get farmed by bots and sybil wallets
- DAOs get manipulated by fake or low-quality voters
- dApps treat all wallets equally regardless of on-chain history
- AI agents operating on Solana have no verifiable identity or accountability layer

SolIdentity fixes all of this.

---

## What We Built

SolIdentity is two things in one:

**1. Social Identity** — A trust scoring and identity resolution layer for human wallets. Search any .sol domain or wallet address and get a complete on-chain identity profile including domain name, trust score, transaction history, wallet age, SOL balance, and SNS social records.

**2. Agent Identity** — A verified registry for AI agents operating on Solana. Agents register with a .sol identity. Ownership is verified against the SNS on-chain program before registration is accepted. This prevents spam and makes the registry sybil-resistant by design.

---

## How It Works

### Social Identity Flow

1. User connects Phantom wallet or searches any .sol domain or wallet address
2. SolIdentity queries the SNS on-chain program to resolve the domain
3. Fetches wallet transaction history and balance from Solana mainnet RPC
4. Retrieves SNS profile records — Twitter handle, website, avatar
5. Calculates a trust score from verified on-chain signals
6. Returns a structured identity profile instantly

### Agent Identity Flow

1. Operator connects their Phantom wallet
2. Enters their agent name and optionally their .sol domain
3. SolIdentity queries the SNS program on-chain to verify domain ownership
4. If the connected wallet owns the domain — agent is registered as ON-CHAIN VERIFIED
5. If the domain belongs to a different wallet — registration is rejected
6. If no domain is provided — agent registers as unverified
7. All agents persist in the registry and are visible to everyone

---

## On-Chain Architecture

SolIdentity reads directly from Solana smart contracts. No centralized API. No off-chain data sources for identity resolution.

**SNS Program** (`namesLPaMn8YnUQcc7EgFnSY2L9pAXQnQhBBqjnmX`)

Every identity lookup and agent verification queries this program directly:

- `.sol domain resolution` — resolves any domain to its owner wallet address
- `Reverse lookup` — finds the primary .sol domain for any wallet
- `Profile records` — fetches Twitter, website, and social records stored on-chain
- `Ownership verification` — confirms which wallet owns a given .sol domain before agent registration

**Data Flow:**
Input (.sol domain or wallet address)
|
v
SNS On-Chain Program --> resolve domain --> wallet address
|
v
Solana Mainnet RPC --> transaction history, balance, account age
|
v
Trust Score Algorithm --> structured identity profile

**Why this matters:**
- Identity data is publicly verifiable by anyone on-chain
- Cannot be censored, manipulated, or taken offline
- No single point of failure or centralized control

---

## Trust Score

SolIdentity scores wallets based on signals that are costly to fake and easy to verify:

| Signal | Max Points | Why It Matters |
|--------|-----------|----------------|
| .sol Domain | 30 | Strong identity commitment — domain owners are less likely to be disposable wallets |
| Wallet Age | 25 | Older wallets indicate persistence and reduce sybil likelihood |
| Transactions | 25 | Real usage leaves a trail — higher activity suggests genuine participation |
| SOL Balance | 20 | Economic stake aligns incentives and reduces malicious behavior |

**Score Levels:**

| Score | Level |
|-------|-------|
| 75-100 | High Trust |
| 50-74 | Medium Trust |
| 25-49 | Low Trust |
| 0-24 | Very Low Trust |

Wallet age and transaction count are calculated by paginating up to 2,000 on-chain transactions — giving accurate historical data for the vast majority of wallets.

---

## Agent Registry

The Agent Registry is an on-chain verified directory of AI agents operating on Solana.

**The problem it solves:**

AI agents are increasingly active on Solana — trading bots, governance agents, yield optimizers, NFT buyers. Right now these agents are completely anonymous. You cannot tell if an agent is legitimate, who built it, or what it has done. There is no accountability layer.

**How verification works:**

When registering an agent, SolIdentity queries the SNS program to verify the registering wallet actually owns the agent's .sol domain. This means:

- Only the real owner of `my-bot.sol` can register `my-bot.sol` as an agent
- Attempts to register domains owned by others are rejected on-chain
- Verified agents display an ON-CHAIN VERIFIED badge
- Agents without a .sol domain can register but remain unverified

**Agent profiles include:**
- Agent name and .sol identity
- Creator wallet — the human owner, establishing accountability
- Agent wallet — the bot wallet that executes transactions
- Agent type — Trading, Governance, NFT, DeFi, or Custom
- Trust score
- Action log — operators can record significant agent actions
- Active duration and last activity

---

## SDK

SolIdentity is built as a reusable SDK published on npm. Any Solana dApp can integrate identity and trust scoring in minutes.

### Install

```bash
npm install sol-identity
```

### Get full identity profile

```js
import { getIdentity } from 'sol-identity'

const identity = await getIdentity("bonfida.sol", {
  rpcUrl: "https://your-rpc-url.com"
})

console.log(identity)
// {
//   walletAddress: "HxK8...",
//   domain: "bonfida.sol",
//   records: { twitter: "bonfida", url: "https://bonfida.org" },
//   trustScore: { score: 85, level: "High Trust", breakdown: {...} },
//   stats: { balance: 12.4, transactionCount: 1820, accountAge: 1200 }
// }
```

### Gate features by trust score

```js
import { getTrustScore } from 'sol-identity'

const { score } = await getTrustScore(walletAddress, {
  rpcUrl: "https://your-rpc-url.com"
})

if (score < 40) return "Access denied — low trust wallet"
if (score >= 75) grantFullAccess()
```

### Resolve a .sol domain

```js
import { resolveDomain } from 'sol-identity'

const result = await resolveDomain("bonfida.sol", {
  rpcUrl: "https://your-rpc-url.com"
})

console.log(result.walletAddress) // "HxK8..."
console.log(result.records.twitter) // "bonfida"
```

---

## Use Cases

**For dApp developers:**
- Replace raw wallet addresses with named, scored identities at login
- Gate airdrops, governance votes, or premium features by minimum trust score
- Display reputation scores in community dashboards and leaderboards
- Verify AI agent identities before allowing automated interactions

**For users:**
- Understand your on-chain reputation score
- See exactly how protocols evaluate your wallet
- Search and verify any .sol identity instantly

**For AI agent operators:**
- Give your agent a verifiable on-chain identity
- Establish accountability through SNS domain ownership verification
- Build trust with users and protocols over time through logged actions

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Blockchain | @solana/web3.js |
| Identity | @bonfida/spl-name-service |
| Wallet | Solana Wallet Adapter (Phantom) |
| Caching | In-memory cache (5 minute TTL) |
| Storage | Upstash Redis (agent registry persistence) |
| Hosting | Vercel |
| Package | npm — sol-identity@1.0.1 |

---

## Running Locally

```bash
git clone https://github.com/Rolexcode/sol-identity
cd sol-identity
npm install
```

Create `.env` in the root directory:
VITE_RPC_URL=your_solana_mainnet_rpc_url
VITE_UPSTASH_URL=your_upstash_redis_url
VITE_UPSTASH_TOKEN=your_upstash_token

```bash
npm run dev
```

Open `http://localhost:5173`

---

## Roadmap

- **Multi-domain support** — list all .sol domains owned by a wallet via Helius indexer
- **On-chain agent program** — migrate agent registry to a custom Solana program
- **Automatic action logging** — record agent transactions on-chain via Helius webhooks
- **Reputation portability** — export identity profiles as verifiable credentials
- **npm v2** — expanded SDK with React hooks and UI components

---

## Built For

SNS Identity Track — Colosseum Frontier Hackathon
Powered by SNS · Superteam MY · MagicBlock · Built on Solana
