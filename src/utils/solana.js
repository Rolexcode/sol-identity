// solana.js
// Handles all direct communication with the Solana blockchain
// Results are cached for 5 minutes to reduce RPC calls

import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getCache, setCache } from "./cache";

const connection = new Connection(
  import.meta.env.VITE_RPC_URL,
  "confirmed"
);

function isValidPublicKey(key) {
  try {
    new PublicKey(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Paginates through ALL transaction history
 * Gets true wallet age AND accurate transaction count
 * Results cached for 5 minutes
 * @param {PublicKey} publicKey
 * @returns {{ accountAge: number, transactionCount: number }}
 */
async function getWalletHistory(publicKey) {
  const cacheKey = `history:${publicKey.toString()}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    let lastSignature = undefined;
    let oldestBlockTime = null;
    let totalCount = 0;

    // No page limit — paginate through full history
    // QuickNode 10M credits handles this easily
    while (true) {
      const options = { limit: 50 };
      if (lastSignature) options.before = lastSignature;

      const signatures = await connection.getSignaturesForAddress(
        publicKey,
        options
      );

      if (signatures.length === 0) break;

      totalCount += signatures.length;

      const oldest = signatures[signatures.length - 1];
      if (oldest?.blockTime) {
        oldestBlockTime = oldest.blockTime;
      }

      // Reached beginning of history
      if (signatures.length < 50) break;

      lastSignature = signatures[signatures.length - 1].signature;
    }

    const accountAge = oldestBlockTime
      ? Math.floor(
          (Date.now() - oldestBlockTime * 1000) / (1000 * 60 * 60 * 24)
        )
      : 0;

    const result = { accountAge, transactionCount: totalCount };

    // Cache result for 5 minutes
    setCache(cacheKey, result);

    return result;
  } catch (error) {
    console.error("Error getting wallet history:", error);
    return { accountAge: 0, transactionCount: 0 };
  }
}

/**
 * Fetches all wallet data needed for trust score
 * Balance + full history in parallel
 * @param {string} walletAddress
 * @returns {{ balance, transactionCount, accountAge }}
 */
export async function getWalletData(walletAddress) {
  if (!isValidPublicKey(walletAddress)) {
    return { balance: 0, transactionCount: 0, accountAge: 0 };
  }

  const cacheKey = `wallet:${walletAddress}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const publicKey = new PublicKey(walletAddress);

    const [balanceLamports, history] = await Promise.all([
      connection.getBalance(publicKey),
      getWalletHistory(publicKey),
    ]);

    const result = {
      balance: balanceLamports / LAMPORTS_PER_SOL,
      transactionCount: history.transactionCount,
      accountAge: history.accountAge,
    };

    // Cache for 5 minutes
    setCache(cacheKey, result);

    return result;
  } catch (error) {
    console.error("Error fetching wallet data:", error);
    return { balance: 0, transactionCount: 0, accountAge: 0 };
  }
}

export { connection };
