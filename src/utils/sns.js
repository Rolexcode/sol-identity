// sns.js
// Handles all SNS domain lookups
// Results cached for 5 minutes

import { Connection, PublicKey } from "@solana/web3.js";
import { resolve, reverseLookup, getRecords } from "@bonfida/spl-name-service";
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

function cleanDomain(domain) {
  return domain.replace(".sol", "").trim().toLowerCase();
}

/**
 * Looks up primary .sol domain for a wallet
 * @param {string} walletAddress
 * @returns {string|null}
 */
export async function getDomainFromWallet(walletAddress) {
  if (!isValidPublicKey(walletAddress)) return null;

  const cacheKey = `domain:${walletAddress}`;
  const cached = getCache(cacheKey);
  if (cached !== null) return cached;

  try {
    const domainName = await reverseLookup(connection, walletAddress);
    const result = domainName ? `${domainName}.sol` : null;
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Reverse lookup failed:", error);
    setCache(cacheKey, null);
    return null;
  }
}

/**
 * Resolves a .sol domain to wallet address
 * @param {string} domain
 * @returns {string|null}
 */
export async function getWalletFromDomain(domain) {
  const domainName = cleanDomain(domain);
  if (!domainName) return null;

  const cacheKey = `wallet-from-domain:${domainName}`;
  const cached = getCache(cacheKey);
  if (cached !== null) return cached;

  try {
    const publicKey = await resolve(connection, domainName);
    const result = publicKey?.toString() || null;
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Domain resolve failed:", error);
    return null;
  }
}

/**
 * Fetches SNS profile records for a .sol domain
 * @param {string} domain
 * @returns {object}
 */
export async function getDomainRecords(domain) {
  const domainName = cleanDomain(domain);
  if (!domainName) return {};

  const cacheKey = `records:${domainName}`;
  const cached = getCache(cacheKey);
  if (cached !== null) return cached;

  try {
    const records = await getRecords(connection, domainName);
    const result = records || {};
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Get records failed:", error);
    return {};
  }
}
