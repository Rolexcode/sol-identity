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
 * Gets the oldest transaction to find true wallet age
 * Paginates backwards through history using before cursor
 * Stops when no more transactions found
 * @param {PublicKey} publicKey
 * @returns {number} - Account age in days
 */
async function getTrueWalletAge(publicKey) {
  try {
    let lastSignature = undefined;
    let oldestBlockTime = null;

    // Paginate up to 10 pages (500 transactions back)
    // Enough for most wallets without burning RPC credits
    for (let page = 0; page < 10; page++) {
      const options = { limit: 50 };
      if (lastSignature) options.before = lastSignature;

      const signatures = await connection.getSignaturesForAddress(
        publicKey,
        options
      );

      // No more transactions — we reached the beginning
      if (signatures.length === 0) break;

      // Track oldest block time seen
      const oldest = signatures[signatures.length - 1];
      if (oldest?.blockTime) {
        oldestBlockTime = oldest.blockTime;
      }

      // If we got less than 50, we reached the beginning
      if (signatures.length < 50) break;

      // Move cursor back for next page
      lastSignature = signatures[signatures.length - 1].signature;
    }

    if (!oldestBlockTime) return 0;

    return Math.floor(
      (Date.now() - oldestBlockTime * 1000) / (1000 * 60 * 60 * 24)
    );
  } catch (error) {
    console.error("Error getting wallet age:", error);
    return 0;
  }
}

/**
 * Fetches wallet data needed for trust score calculation
 * @param {string} walletAddress
 * @returns {object} - { balance, transactionCount, accountAge }
 */
export async function getWalletData(walletAddress) {
  try {
    if (!isValidPublicKey(walletAddress)) {
      return { balance: 0, transactionCount: 0, accountAge: 0 };
    }

    const publicKey = new PublicKey(walletAddress);

    // Run all three fetches in parallel for speed
    const [balanceLamports, signatures, accountAge] = await Promise.all([
      connection.getBalance(publicKey),
      connection.getSignaturesForAddress(publicKey, { limit: 50 }),
      getTrueWalletAge(publicKey),
    ]);

    const balance = balanceLamports / LAMPORTS_PER_SOL;

    // Total count capped at 50 for now
    // Full count would require full pagination (too slow for UI)
    const transactionCount = signatures.length;

    return { balance, transactionCount, accountAge };
  } catch (error) {
    console.error("Error fetching wallet data:", error);
    return { balance: 0, transactionCount: 0, accountAge: 0 };
  }
}

export { connection };
