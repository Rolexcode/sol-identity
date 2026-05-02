// sns.js
// Handles all SNS (Solana Name Service) domain lookups
// RPC URL loaded from environment variable — never hardcoded

import { Connection, PublicKey } from "@solana/web3.js";
import { resolve, reverseLookup, getRecords } from "@bonfida/spl-name-service";

const connection = new Connection(
  import.meta.env.VITE_RPC_URL,
  "confirmed"
);

// Validates a wallet address string before making RPC calls
function isValidPublicKey(key) {
  try {
    new PublicKey(key);
    return true;
  } catch {
    return false;
  }
}

// Strips .sol suffix and normalizes domain string
function cleanDomain(domain) {
  return domain.replace(".sol", "").trim().toLowerCase();
}

/**
 * Looks up primary .sol domain for a wallet address
 * Note: only returns primary domain, not all owned domains
 * @param {string} walletAddress
 * @returns {string|null} - e.g. "rolex.sol" or null
 */
export async function getDomainFromWallet(walletAddress) {
  try {
    if (!isValidPublicKey(walletAddress)) return null;
    const domainName = await reverseLookup(connection, walletAddress);
    return domainName ? `${domainName}.sol` : null;
  } catch (error) {
    console.error("Reverse lookup failed:", error);
    return null;
  }
}

/**
 * Resolves a .sol domain to its wallet address
 * @param {string} domain - e.g. "rolex.sol"
 * @returns {string|null} - Wallet address or null
 */
export async function getWalletFromDomain(domain) {
  try {
    const domainName = cleanDomain(domain);
    if (!domainName) return null;
    const publicKey = await resolve(connection, domainName);
    return publicKey?.toString() || null;
  } catch (error) {
    console.error("Domain resolve failed:", error);
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
    const domainName = cleanDomain(domain);
    if (!domainName) return {};
    const records = await getRecords(connection, domainName);
    return records || {};
  } catch (error) {
    console.error("Get records failed:", error);
    return {};
  }
}
