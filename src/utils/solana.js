// solana.js
// Handles all direct communication with the Solana blockchain

import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

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
 * Paginates through transaction history to get
 * true wallet age AND accurate transaction count
 * Stops at 20 pages (1000 transactions) to protect RPC credits
 * @param {PublicKey} publicKey
 * @returns {{ accountAge: number, transactionCount: number }}
 */
async function getWalletHistory(publicKey) {
  try {
    let lastSignature = undefined;
    let oldestBlockTime = null;
    let totalCount = 0;
    const MAX_PAGES = 20;

    for (let page = 0; page < MAX_PAGES; page++) {
      const options = { limit: 50 };
      if (lastSignature) options.before = lastSignature;

      const signatures = await connection.getSignaturesForAddress(
        publicKey,
        options
      );

      if (signatures.length === 0) break;

      totalCount += signatures.length;

      // Track oldest block time
      const oldest = signatures[signatures.length - 1];
      if (oldest?.blockTime) {
        oldestBlockTime = oldest.blockTime;
      }

      // Reached the beginning of history
      if (signatures.length < 50) break;

      // Move cursor back for next page
      lastSignature = signatures[signatures.length - 1].signature;
    }

    const accountAge = oldestBlockTime
      ? Math.floor((Date.now() - oldestBlockTime * 1000) / (1000 * 60 * 60 * 24))
      : 0;

    return { accountAge, transactionCount: totalCount };
  } catch (error) {
    console.error("Error getting wallet history:", error);
    return { accountAge: 0, transactionCount: 0 };
  }
}

/**
 * Fetches all wallet data needed for trust score calculation
 * Runs balance fetch and history pagination in parallel
 * @param {string} walletAddress
 * @returns {object} - { balance, transactionCount, accountAge }
 */
export async function getWalletData(walletAddress) {
  try {
    if (!isValidPublicKey(walletAddress)) {
      return { balance: 0, transactionCount: 0, accountAge: 0 };
    }

    const publicKey = new PublicKey(walletAddress);

    // Run balance and history in parallel for speed
    const [balanceLamports, history] = await Promise.all([
      connection.getBalance(publicKey),
      getWalletHistory(publicKey),
    ]);

    const balance = balanceLamports / LAMPORTS_PER_SOL;

    return {
      balance,
      transactionCount: history.transactionCount,
      accountAge: history.accountAge,
    };
  } catch (error) {
    console.error("Error fetching wallet data:", error);
    return { balance: 0, transactionCount: 0, accountAge: 0 };
  }
}

export { connection };
