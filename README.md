# SolIdentity

**The identity and trust layer for Solana.**

SolIdentity turns any Solana wallet address or .sol domain into a verifiable identity profile — complete with a trust score, on-chain history, and social records. It also provides an agent registry where AI agents can establish verified on-chain identities using SNS domains.

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

This creates real problems:

- **Airdrops** get farmed by bots and sybil wallets
- **DAOs** get manipulated by fake voters
- **dApps** treat all wallets equally regardless of history
- **AI agents** have no verifiable identity or accountability

SolIdentity fixes this.

---

## How It Works

### Social Identity

1. User connects their Phantom wallet or searches any .sol domain
2. SolIdentity queries the **SNS on-chain program** to resolve the domain
3. Fetches wallet transaction history from Solana mainnet RPC
4. Retrieves SNS profile records (Twitter, website, avatar)
5. Calculates a trust score from verified on-chain signals
6. Returns a structured identity profile

### Agent Identity

1. Developer or operator connects their wallet
2. Enters their agent name — SolIdentity checks if they own the matching .sol domain on-chain
3. If ownership is verified via SNS → agent is registered as **ON-CHAIN VERIFIED**
4. If domain is owned by someone else → registration is rejected (sybil prevention)
5. If domain does not exist → agent is registered as unverified
6. All registered agents are stored persistently and visible to everyone

---

## On-Chain Architecture

SolIdentity reads directly from Solana smart contracts. No centralized API. No off-chain data sources for identity.

**SNS Program** (`namesLPaMn8YnUQcc7EgFnSY2L9pAXQnQhBBqjnmX`)

Every identity lookup and agent verification queries this program directly:

- `.sol domain resolution` — resolves any domain to its owner wallet
- `Reverse lookup` — finds the primary .sol domain for any wallet address
- `Profile records` — fetches Twitter, website, and social records stored on-chain
- `Ownership verification` — confirms which wallet owns a given .sol domain

**Data Flow:**
Input (.sol domain or wallet address)
↓
SNS On-Chain Program → resolve domain → wallet address
↓
Solana RPC → transaction history, balance, account age
↓
Trust Score Algorithm → structured identity profile

**Why this matters:**
- Identity data is publicly verifiable by anyone
- Cannot be censored, manipulated, or taken offline
- No single point of failure

---

## Trust Score

SolIdentity scores wallets based on signals that are **costly to fake and easy to verify**:

| Signal | Max Points | Why It Matters |
|--------|-----------|----------------|
| .sol Domain | 30 | Strong identity commitment — domain owners are less likely to be disposable wallets |
| Wallet Age | 25 | Older wallets indicate persistence and reduce sybil likelihood |
| Transactions | 25 | Real usage leaves a trail — higher activity suggests genuine participation |
| SOL Balance | 20 | Economic stake aligns incentives and reduces malicious behavior |

**Score Levels:**

| Score | Level |
|-------|-------|
| 75 - 100 | High Trust |
| 50 - 74 | Medium Trust |
| 25 - 49 | Low Trust |
| 0 - 24 | Very Low Trust |

**Accuracy:** Wallet age and transaction count are calculated by paginating up to 2,000 transactions on Solana mainnet — giving accurate historical data for the vast majority of wallets.

---

## Agent Registry

The Agent Registry is an on-chain verified directory of AI agents operating on Solana.

**The problem it solves:**

AI agents are increasingly common on Solana — trading bots, governance agents, yield optimizers. Right now these agents are anonymous. You cannot tell if an agent is legitimate, who created it, or what it has done.

**How verification works:**

When registering an agent, SolIdentity queries the SNS program to check if the registering wallet owns the agent's .sol domain. This means:

- Only the real owner of `my-bot.sol` can register `my-bot.sol` as an agent
- Attempts to register domains owned by others are rejected on-chain
- Verified agents display an **ON-CHAIN VERIFIED** badge
- Agents without a .sol domain can still register but remain unverified

**Agent profiles include:**
- Agent domain (.sol identity)
- Creator wallet (human owner — accountability)
- Agent wallet (bot wallet — the executor)
- Agent type (Trading, Governance, NFT, DeFi, Custom)
- Trust score
- Action history (executions, failures, success rate)
- Active duration

---

## SDK

SolIdentity is built as a reusable SDK. Any Solana dApp can integrate identity and trust scoring in minutes.

### Install

```bash
npm install sol-identity
```

### Get full identity profile

```js
import { getIdentity } from 'sol-identity'

// Works with .sol domains
const identity = await getIdentity("bonfida.sol")

// Works with raw wallet addresses
const identity = await getIdentity("9oFYps...gjTv")

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

const { score, level } = await getTrustScore(walletAddress)

if (score < 40) {
  return "Access denied — low trust wallet"
}
```

### Resolve a .sol domain

```js
import { resolveDomain } from 'sol-identity'

const result = await resolveDomain("bonfida.sol")
// { walletAddress: "HxK8...", records: { twitter: "bonfida", url: "..." } }
```

### Custom RPC

```js
const identity = await getIdentity("bonfida.sol", {
  rpcUrl: "https://your-rpc-url.com"
})
```

---

## Use Cases

**For dApp developers:**
- Replace raw wallet addresses with named, scored identities at login
- Gate airdrops, governance votes, or premium features by minimum trust score
- Display reputation scores in community dashboards and leaderboards
- Verify agent identities before allowing automated interactions

**For users:**
- Understand your on-chain reputation score
- See exactly how protocols will evaluate your wallet
- Search and verify any .sol identity instantly

**For AI agent operators:**
- Give your agent a verifiable on-chain identity
- Establish accountability through SNS domain ownership
- Build trust with users and protocols over time

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Blockchain | @solana/web3.js |
| Identity | @bonfida/spl-name-service |
| Wallet | Solana Wallet Adapter (Phantom) |
| Storage | Upstash Redis (agent registry) |
| Hosting | Vercel |
| Package | npm (sol-identity) |

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
- **Agent action logging** — record agent transactions on-chain with identity attached
- **Reputation portability** — export identity profiles as verifiable credentials
- **npm v2** — expanded SDK with React hooks and UI components

---

## Built For

SNS Identity Track — Colosseum Frontier Hackathon
Powered by SNS · Superteam MY · MagicBlock · Built on Solana
