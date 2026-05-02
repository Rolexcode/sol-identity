// trustScore.js
// Core logic for calculating wallet trust score 0-100
// Designed to be used as an SDK — import calculateTrustScore anywhere

/**
 * Calculates trust score from on-chain wallet data
 *
 * Scoring breakdown:
 * - .sol domain:       +30 pts (strongest identity signal)
 * - Wallet age:        up to +25 pts (max at 365+ days)
 * - Transactions:      up to +25 pts (max at 200+ transactions)
 * - SOL balance:       up to +20 pts (max at 1+ SOL)
 *
 * @param {object} walletData - { balance, transactionCount, accountAge }
 * @param {boolean} hasDomain - Whether wallet has a .sol domain
 * @returns {object} - { score, level, breakdown }
 */
export function calculateTrustScore(walletData, hasDomain) {
  const { balance, transactionCount, accountAge } = walletData;

  let score = 0;
  const breakdown = {};

  // .sol Domain (0 or 30 points)
  const domainPoints = hasDomain ? 30 : 0;
  breakdown.domain = domainPoints;
  score += domainPoints;

  // Wallet Age — max at 365 days (1 year)
  const agePoints = Math.min(25, Math.floor((accountAge / 365) * 25));
  breakdown.age = agePoints;
  score += agePoints;

  // Transaction Count — max at 200 transactions
  const txPoints = Math.min(25, Math.floor((transactionCount / 200) * 25));
  breakdown.transactions = txPoints;
  score += txPoints;

  // SOL Balance — max at 1 SOL
  const balancePoints = Math.min(20, Math.floor(balance * 20));
  breakdown.balance = balancePoints;
  score += balancePoints;

  // Trust level label
  let level;
  if (score >= 75) level = "High Trust";
  else if (score >= 50) level = "Medium Trust";
  else if (score >= 25) level = "Low Trust";
  else level = "Very Low Trust";

  return { score, level, breakdown };
}

/**
 * Returns color based on trust level
 * Used by TrustScore UI component
 * @param {string} level
 * @returns {string} - CSS color string
 */
export function getTrustColor(level) {
  switch (level) {
    case "High Trust":   return "#34d399";
    case "Medium Trust": return "#fbbf24";
    case "Low Trust":    return "#fb923c";
    default:             return "#f87171";
  }
}
