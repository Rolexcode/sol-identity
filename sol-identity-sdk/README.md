# sol-identity

> On-chain identity and trust scoring for Solana wallets and .sol domains

[![npm version](https://badge.fury.io/js/sol-identity.svg)](https://www.npmjs.com/package/sol-identity)

## Install

```bash
npm install sol-identity
```

## Usage

```js
import { getIdentity, getTrustScore, resolveDomain } from 'sol-identity'

// Get full identity profile
const identity = await getIdentity("bonfida.sol")
console.log(identity.trustScore.score) // 85
console.log(identity.domain) // "bonfida.sol"

// Quick trust check — gate features
const { score } = await getTrustScore(walletAddress)
if (score < 40) return "Access denied"

// Resolve a .sol domain
const result = await resolveDomain("bonfida.sol")
console.log(result.walletAddress)
```

## Custom RPC

```js
const identity = await getIdentity("bonfida.sol", {
  rpcUrl: "https://your-rpc-url.com"
})
```

## Live Demo

https://sol-identity.vercel.app

## License

MIT
