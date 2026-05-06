# sol-identity

**On-chain identity and trust scoring for Solana wallets and .sol domains.**

Turn any Solana wallet address or .sol domain into a verified identity profile with a trust score — powered entirely by on-chain data via SNS.

[![npm version](https://img.shields.io/npm/v/sol-identity.svg)](https://www.npmjs.com/package/sol-identity)

## Install

```bash
npm install sol-identity
```

## Peer Dependencies

```bash
npm install @solana/web3.js @bonfida/spl-name-service
```

---

## Quick Start

```js
import { getIdentity } from 'sol-identity'

// Works with .sol domains
const identity = await getIdentity("bonfida.sol", {
  rpcUrl: "https://your-rpc-url.com"
})

// Works with raw wallet addresses
const identity = await getIdentity("9oFYps...gjTv", {
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

---

## API Reference

### getIdentity(input, options?)

Returns a complete identity profile for any wallet or .sol domain.

**Parameters:**
- `input` — `.sol` domain (e.g. `"bonfida.sol"`) or wallet address string
- `options.rpcUrl` — Your Solana RPC URL (recommended for production)

**Returns:**
```ts
{
  walletAddress: string
  domain: string | null        // Primary .sol domain or null
  records: {
    twitter: string | null     // Twitter handle from SNS records
    url: string | null         // Website from SNS records
  }
  trustScore: {
    score: number              // 0-100
    level: string              // "High Trust" | "Medium Trust" | "Low Trust" | "Very Low Trust"
    breakdown: {
      domain: number           // 0 or 30 points
      age: number              // 0-25 points
      transactions: number     // 0-25 points
      balance: number          // 0-20 points
    }
  }
  stats: {
    balance: number            // SOL balance
    transactionCount: number   // Transaction count (up to 2000)
    accountAge: number         // Wallet age in days
  }
}
```

---

### getTrustScore(walletAddress, options?)

Quick trust check — returns just the score and level. Useful for gating features.

```js
import { getTrustScore } from 'sol-identity'

const { score, level } = await getTrustScore(walletAddress, {
  rpcUrl: "https://your-rpc-url.com"
})

if (score < 40) {
  return "Access denied — low trust wallet"
}

if (score >= 75) {
  return "High trust user — grant full access"
}
```

---

### resolveDomain(domain, options?)

Resolve a .sol domain to its wallet address and SNS profile records.

```js
import { resolveDomain } from 'sol-identity'

const result = await resolveDomain("bonfida.sol", {
  rpcUrl: "https://your-rpc-url.com"
})

if (result) {
  console.log(result.walletAddress) // "HxK8..."
  console.log(result.records.twitter) // "bonfida"
}
```

---

## Trust Score Philosophy

Scores are based on signals that are **costly to fake and easy to verify on-chain**:

| Signal | Max Points | Why It Matters |
|--------|-----------|----------------|
| .sol Domain | 30 | Strong identity commitment via SNS |
| Wallet Age | 25 | Older wallets = less likely sybil |
| Transactions | 25 | Real usage leaves a verifiable trail |
| SOL Balance | 20 | Economic stake aligns incentives |

**Score Levels:**

| Score | Level |
|-------|-------|
| 75-100 | High Trust |
| 50-74 | Medium Trust |
| 25-49 | Low Trust |
| 0-24 | Very Low Trust |

---

## Use Cases

**Sybil-resistant airdrops:**
```js
const { score } = await getTrustScore(claimantWallet, { rpcUrl })
if (score < 50) reject("Wallet does not meet minimum trust requirement")
```

**Replace raw addresses with identities:**
```js
const identity = await getIdentity(connectedWallet, { rpcUrl })
const displayName = identity.domain || identity.walletAddress.slice(0, 8) + "..."
```

**Gate DAO governance:**
```js
const { score } = await getTrustScore(voterWallet, { rpcUrl })
const voteWeight = score >= 75 ? 2 : 1 // High trust wallets get more weight
```

---

## RPC Configuration

The package defaults to the public Solana mainnet RPC which may be rate limited. For production use, provide your own RPC URL:

- **Helius:** https://helius.dev (generous free tier)
- **QuickNode:** https://quicknode.com (10M credits free)
- **Alchemy:** https://alchemy.com (free tier available)

```js
const identity = await getIdentity("bonfida.sol", {
  rpcUrl: process.env.SOLANA_RPC_URL
})
```

---

## Important Notes

- Wallet age and transaction count are calculated by paginating up to 2,000 on-chain transactions
- Reverse lookup returns the **primary** .sol domain only — wallets may own multiple domains
- All data is read directly from Solana mainnet — no centralized API or off-chain data
- Requires `@solana/web3.js` and `@bonfida/spl-name-service` as peer dependencies

---

## Live Demo

**App:** https://sol-identity.vercel.app
**GitHub:** https://github.com/Rolexcode/sol-identity

---

## License

MIT
