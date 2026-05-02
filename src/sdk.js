Set-Content -Path "src\sdk.js" -Encoding UTF8 -Value @'
// sdk.js
// Sol Identity SDK
// Drop this into any Solana dApp to get instant identity + trust scoring
//
// Usage:
//   import { getIdentity } from './sdk'
//   const identity = await getIdentity("rolex.sol")
//   const identity = await getIdentity("9oFYps...gjTv")

import { getWalletData } from "./utils/solana";
import { getDomainFromWallet, getDomainRecords, getWalletFromDomain } from "./utils/sns";
import { calculateTrustScore } from "./utils/trustScore";

/**
 * Core SDK function — resolves any input to a full identity profile
 * Accepts either a .sol domain or a raw wallet address
 *
 * @param {string} input - .sol domain (e.g. "rolex.sol") or wallet address
 * @returns {object} - Full identity object (see structure below)
 *
 * Returns:
 * {
 *   walletAddress: string,
 *   domain: string | null,
 *   records: {
 *     twitter: string | null,
 *     url: string | null,
 *   },
 *   trustScore: {
 *     score: number,        // 0-100
 *     level: string,        // "High Trust" | "Medium Trust" | "Low Trust" | "Very Low Trust"
 *     breakdown: {
 *       domain: number,     // 0 or 30
 *       age: number,        // 0-25
 *       transactions: number, // 0-25
 *       balance: number,    // 0-20
 *     }
 *   },
 *   stats: {
 *     balance: number,      // SOL balance
 *     transactionCount: number,
 *     accountAge: number,   // days
 *   }
 * }
 */
export async function getIdentity(input) {
  if (!input || typeof input !== "string") {
    throw new Error("Input must be a .sol domain or wallet address string");
  }

  const trimmed = input.trim();
  let walletAddress = trimmed;

  // If input is a .sol domain, resolve it first
  if (trimmed.toLowerCase().endsWith(".sol")) {
    const resolved = await getWalletFromDomain(trimmed);
    if (!resolved) {
      throw new Error(`Domain "${trimmed}" could not be resolved`);
    }
    walletAddress = resolved;
  }

  // Fetch all data in parallel where possible
  const walletData = await getWalletData(walletAddress);
  const domain = await getDomainFromWallet(walletAddress);
  const records = domain ? await getDomainRecords(domain) : {};
  const trustScore = calculateTrustScore(walletData, !!domain);

  // Return clean structured identity object
  return {
    walletAddress,
    domain,
    records: {
      twitter: records?.twitter || null,
      url: records?.url || null,
    },
    trustScore: {
      score: trustScore.score,
      level: trustScore.level,
      breakdown: trustScore.breakdown,
    },
    stats: {
      balance: walletData.balance,
      transactionCount: walletData.transactionCount,
      accountAge: walletData.accountAge,
    },
  };
}

/**
 * Quick trust check — returns just the score and level
 * Useful for gating features in dApps
 *
 * @param {string} walletAddress - Raw wallet address only
 * @returns {{ score: number, level: string }}
 *
 * Example:
 *   const { score } = await getTrustScore(walletAddress)
 *   if (score < 40) return "Access denied"
 */
export async function getTrustScore(walletAddress) {
  const walletData = await getWalletData(walletAddress);
  const domain = await getDomainFromWallet(walletAddress);
  const result = calculateTrustScore(walletData, !!domain);
  return {
    score: result.score,
    level: result.level,
  };
}

/**
 * Resolve a .sol domain to wallet + profile
 * @param {string} domain - e.g. "rolex.sol"
 * @returns {{ walletAddress: string, records: object } | null}
 */
export async function resolveDomain(domain) {
  const walletAddress = await getWalletFromDomain(domain);
  if (!walletAddress) return null;
  const records = await getDomainRecords(domain);
  return { walletAddress, records };
}
'@