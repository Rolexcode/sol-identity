// trustScore.js
// Core logic for calculating a wallet's trust score (0-100)
// Based on wallet age, transaction history, SOL balance, and .sol domain ownership

/**
 * Calculates a trust score from 0 to 100 based on on-chain data
 * Higher score = more established, trustworthy wallet
 *
 * Scoring breakdown:
 * - Has .sol domain:        +30 points
 * - Wallet age:             up to +25 points
 * - Transaction count:      up to +25 points
 * - SOL balance:            up to +20 points
 *
 * @param {object} walletData - { balance, transactionCount, accountAge }
 * @param {boolean} hasDomain - Whether wallet has a .sol domain
 * @returns {object} - { score, breakdown, level }
 */
export function calculateTrustScore(walletData, hasDomain) {
  const { balance, transactionCount, accountAge } = walletData;

  let score = 0;
  const breakdown = {};

  // .sol Domain Check (0 or 30 points)
  const domainPoints = hasDomain ? 30 : 0;
  breakdown.domain = domainPoints;
  score += domainPoints;

  // Wallet Age Score (0 to 25 points)
  const agePoints = Math.min(25, Math.floor((accountAge / 180) * 25));
  breakdown.age = agePoints;
  score += agePoints;

  // Transaction Count Score (0 to 25 points)
  const txPoints = Math.min(25, Math.floor((transactionCount / 50) * 25));
  breakdown.transactions = txPoints;
  score += txPoints;

  // SOL Balance Score (0 to 20 points)
  const balancePoints = Math.min(20, Math.floor(balance * 20));
  breakdown.balance = balancePoints;
  score += balancePoints;

  // Trust Level Label
  let level;
  if (score >= 75) level = "High Trust";
  else if (score >= 50) level = "Medium Trust";
  else if (score >= 25) level = "Low Trust";
  else level = "Very Low Trust";

  return { score, level, breakdown };
}

/**
 * Returns a Tailwind color class based on trust level
 * @param {string} level - Trust level label
 * @returns {string} - Tailwind color class
 */
export function getTrustColor(level) {
  switch (level) {
    case "High Trust":   return "text-green-400";
    case "Medium Trust": return "text-yellow-400";
    case "Low Trust":    return "text-orange-400";
    default:             return "text-red-400";
  }
}