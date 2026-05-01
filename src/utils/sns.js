// sns.js
// Handles all SNS (Solana Name Service) domain lookups
// Connected to MAINNET for real .sol domain data

import { Connection } from "@solana/web3.js";
import { resolve, reverseLookup, getRecords } from "@bonfida/spl-name-service";

// Mainnet connection
const connection = new Connection(
  import.meta.env.VITE_RPC_URL,
  "confirmed"
);

/**
 * Looks up the .sol domain for a given wallet address
 * @param {string} walletAddress - Wallet public key as string
 * @returns {string|null} - e.g. "rolex.sol" or null
 */
export async function getDomainFromWallet(walletAddress) {
  try {
    const domainName = await reverseLookup(connection, walletAddress);
    return domainName ? `${domainName}.sol` : null;
  } catch (error) {
    return null;
  }
}

/**
 * Looks up wallet address for a given .sol domain
 * @param {string} domain - e.g. "rolex.sol"
 * @returns {string|null} - Wallet address or null
 */
export async function getWalletFromDomain(domain) {
  try {
    const domainName = domain.replace(".sol", "").trim().toLowerCase();
    const publicKey = await resolve(connection, domainName);
    return publicKey.toString();
  } catch (error) {
    return null;
  }
}

/**
 * Fetches SNS profile records for a .sol domain
 * @param {string} domain - e.g. "rolex.sol"
 * @returns {object} - Profile records (twitter, url etc)
 */
export async function getDomainRecords(domain) {
  try {
    const domainName = domain.replace(".sol", "").trim().toLowerCase();
    const records = await getRecords(connection, domainName);
    return records || {};
  } catch (error) {
    return {};
  }
}
