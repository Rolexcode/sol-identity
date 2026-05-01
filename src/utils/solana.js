// solana.js
// Handles all direct communication with the Solana blockchain
// Connected to MAINNET for real on-chain data

import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

// Mainnet connection for real data
const connection = new Connection(
  import.meta.env.VITE_RPC_URL,
  "confirmed"
);

/**
 * Fetches basic wallet data needed for trust score calculation
 * @param {string} walletAddress - The wallet public key as string
 * @returns {object} - { balance, transactionCount, accountAge }
 */
export async function getWalletData(walletAddress) {
  try {
    const publicKey = new PublicKey(walletAddress);

    // Get SOL balance
    const balanceLamports = await connection.getBalance(publicKey);
    const balance = balanceLamports / LAMPORTS_PER_SOL;

    // Get last 50 transactions
    const signatures = await connection.getSignaturesForAddress(publicKey, {
      limit: 50,
    });
    const transactionCount = signatures.length;

    // Calculate wallet age from oldest transaction
    const oldestTx = signatures[signatures.length - 1];
    const accountAge = oldestTx
      ? Math.floor((Date.now() - oldestTx.blockTime * 1000) / (1000 * 60 * 60 * 24))
      : 0;

    return { balance, transactionCount, accountAge };
  } catch (error) {
    console.error("Error fetching wallet data:", error);
    return { balance: 0, transactionCount: 0, accountAge: 0 };
  }
}

// Export connection so other utils can reuse it
export { connection };
