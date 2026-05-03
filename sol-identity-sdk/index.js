// sol-identity
// On-chain identity and trust scoring for Solana wallets and .sol domains
// https://sol-identity.vercel.app
// https://github.com/Rolexcode/sol-identity

import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { resolve, reverseLookup, getRecords } from "@bonfida/spl-name-service";

// Default RPC — developer can override
const DEFAULT_RPC = "https://api.mainnet-beta.solana.com";

/**
 * Creates a Solana connection
 * @param {string} rpcUrl - Optional custom RPC URL
 */
function createConnection(rpcUrl = DEFAULT_RPC) {
  return new Connection(rpcUrl, "confirmed");
}

/**
 * Validates a Solana public key
 */
function isValidPublicKey(key) {
  try {
    new PublicKey(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Cleans a .sol domain string
 */
function cleanDomain(domain) {
  return domain.replace(".sol", "").trim().toLowerCase();
}

/**
 * Fetches wallet transaction history and age
 */
async function getWalletHistory(connection, publicKey) {
  let lastSignature = undefined;
  let oldestBlockTime = null;
  let totalCount = 0;
  const MAX_PAGES = 40;

  for (let page = 0; page < MAX_PAGES; page++) {
    const options = { limit: 50 };
    if (lastSignature) options.before = lastSignature;

    const signatures = await connection.getSignaturesForAddress(publicKey, options);
    if (signatures.length === 0) break;

    totalCount += signatures.length;
    const oldest = signatures[signatures.length - 1];
    if (oldest?.blockTime) oldestBlockTime = oldest.blockTime;
    if (signatures.length < 50) break;

    lastSignature = signatures[signatures.length - 1].signature;
  }

  const accountAge = oldestBlockTime
    ? Math.floor((Date.now() - oldestBlockTime * 1000) / (1000 * 60 * 60 * 24))
    : 0;

  return { accountAge, transactionCount: totalCount };
}

/**
 * Calculates trust score from wallet data
 */
function calculateTrustScore(walletData, hasDomain) {
  const { balance, transactionCount, accountAge } = walletData;
  let score = 0;
  const breakdown = {};

  const domainPoints = hasDomain ? 30 : 0;
  breakdown.domain = domainPoints;
  score += domainPoints;

  const agePoints = Math.min(25, Math.floor((accountAge / 365) * 25));
  breakdown.age = agePoints;
  score += agePoints;

  const txPoints = Math.min(25, Math.floor((transactionCount / 200) * 25));
  breakdown.transactions = txPoints;
  score += txPoints;

  const balancePoints = Math.min(20, Math.floor(balance * 20));
  breakdown.balance = balancePoints;
  score += balancePoints;

  let level;
  if (score >= 75) level = "High Trust";
  else if (score >= 50) level = "Medium Trust";
  else if (score >= 25) level = "Low Trust";
  else level = "Very Low Trust";

  return { score, level, breakdown };
}

/**
 * Get full identity profile for any wallet or .sol domain
 *
 * @param {string} input - .sol domain or wallet address
 * @param {object} options - { rpcUrl: string }
 * @returns {object} Full identity profile
 *
 * @example
 * const identity = await getIdentity("bonfida.sol")
 * const identity = await getIdentity("9oFYps...gjTv")
 */
export async function getIdentity(input, options = {}) {
  if (!input || typeof input !== "string") {
    throw new Error("Input must be a .sol domain or wallet address");
  }

  const connection = createConnection(options.rpcUrl);
  const trimmed = input.trim();
  let walletAddress = trimmed;

  // Resolve .sol domain to wallet address
  if (trimmed.toLowerCase().endsWith(".sol")) {
    const domainName = cleanDomain(trimmed);
    const publicKey = await resolve(connection, domainName);
    if (!publicKey) throw new Error(`Domain "${trimmed}" not found`);
    walletAddress = publicKey.toString();
  }

  if (!isValidPublicKey(walletAddress)) {
    throw new Error("Invalid wallet address");
  }

  const publicKey = new PublicKey(walletAddress);

  // Fetch all data
  const [balanceLamports, history] = await Promise.all([
    connection.getBalance(publicKey),
    getWalletHistory(connection, publicKey),
  ]);

  const balance = balanceLamports / LAMPORTS_PER_SOL;

  // Get .sol domain for wallet
  let domain = null;
  try {
    const domainName = await reverseLookup(connection, walletAddress);
    domain = domainName ? `${domainName}.sol` : null;
  } catch {
    domain = null;
  }

  // Get SNS records
  let records = {};
  if (domain) {
    try {
      records = await getRecords(connection, cleanDomain(domain)) || {};
    } catch {
      records = {};
    }
  }

  const walletData = { balance, ...history };
  const trustScore = calculateTrustScore(walletData, !!domain);

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
      balance,
      transactionCount: history.transactionCount,
      accountAge: history.accountAge,
    },
  };
}

/**
 * Get just the trust score for a wallet
 *
 * @param {string} walletAddress - Solana wallet address
 * @param {object} options - { rpcUrl: string }
 * @returns {{ score: number, level: string }}
 *
 * @example
 * const { score } = await getTrustScore(walletAddress)
 * if (score < 40) return "Access denied"
 */
export async function getTrustScore(walletAddress, options = {}) {
  const connection = createConnection(options.rpcUrl);

  if (!isValidPublicKey(walletAddress)) {
    throw new Error("Invalid wallet address");
  }

  const publicKey = new PublicKey(walletAddress);
  const [balanceLamports, history] = await Promise.all([
    connection.getBalance(publicKey),
    getWalletHistory(connection, publicKey),
  ]);

  let domain = null;
  try {
    const domainName = await reverseLookup(connection, walletAddress);
    domain = domainName ? `${domainName}.sol` : null;
  } catch {
    domain = null;
  }

  const walletData = {
    balance: balanceLamports / LAMPORTS_PER_SOL,
    ...history,
  };

  const result = calculateTrustScore(walletData, !!domain);
  return { score: result.score, level: result.level };
}

/**
 * Resolve a .sol domain to wallet address and profile
 *
 * @param {string} domain - e.g. "bonfida.sol"
 * @param {object} options - { rpcUrl: string }
 * @returns {{ walletAddress: string, records: object } | null}
 *
 * @example
 * const result = await resolveDomain("bonfida.sol")
 * console.log(result.walletAddress)
 */
export async function resolveDomain(domain, options = {}) {
  const connection = createConnection(options.rpcUrl);
  const domainName = cleanDomain(domain);

  try {
    const publicKey = await resolve(connection, domainName);
    if (!publicKey) return null;

    let records = {};
    try {
      records = await getRecords(connection, domainName) || {};
    } catch {
      records = {};
    }

    return {
      walletAddress: publicKey.toString(),
      records: {
        twitter: records?.twitter || null,
        url: records?.url || null,
      },
    };
  } catch {
    return null;
  }
}
