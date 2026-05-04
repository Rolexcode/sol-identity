// api/webhook.js
// Vercel serverless function — receives Helius webhook transactions
// Automatically logs agent actions when their wallet transacts on Solana

const UPSTASH_URL = process.env.VITE_UPSTASH_URL;
const UPSTASH_TOKEN = process.env.VITE_UPSTASH_TOKEN;

/**
 * Makes a request to Upstash Redis REST API
 */
async function redis(command, ...args) {
  const response = await fetch(
    `${UPSTASH_URL}/${command}/${args.join("/")}`,
    {
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
      },
    }
  );
  const data = await response.json();
  return data.result;
}

/**
 * Detects the type of Solana transaction
 * Based on Helius enhanced transaction data
 */
function detectActionType(transaction) {
  const type = transaction.type || "";
  const description = transaction.description || "";

  if (type === "SWAP" || description.toLowerCase().includes("swap")) return "Swap";
  if (type === "TRANSFER" || description.toLowerCase().includes("transfer")) return "Transfer";
  if (type === "NFT_SALE" || description.toLowerCase().includes("nft")) return "NFT Sale";
  if (type === "STAKE_SOL" || description.toLowerCase().includes("stake")) return "Stake";
  if (type === "UNSTAKE_SOL" || description.toLowerCase().includes("unstake")) return "Unstake";
  if (description.toLowerCase().includes("vote")) return "Vote";
  if (description.toLowerCase().includes("mint")) return "Mint";
  return "Transaction";
}

/**
 * Main webhook handler
 * Helius sends an array of enhanced transactions
 */
export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const transactions = req.body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(200).json({ message: "No transactions to process" });
    }

    // Load all registered agents to match wallet addresses
    const agentItems = await redis("LRANGE", "agents", "0", "-1");
    const agents = agentItems
      ? agentItems.map(item => JSON.parse(decodeURIComponent(item)))
      : [];

    let logged = 0;

    for (const tx of transactions) {
      // Get the fee payer (wallet that initiated the transaction)
      const feePayer = tx.feePayer;
      if (!feePayer) continue;

      // Find matching agent by agent wallet address
      const matchingAgent = agents.find(agent => {
        if (!agent.agentWallet || agent.agentWallet === "Not provided") return false;
        // Compare truncated wallet stored vs full address from Helius
        const storedPrefix = agent.agentWallet.split("...")[0];
        return feePayer.startsWith(storedPrefix);
      });

      if (!matchingAgent) continue;

      // Build action entry
      const actionType = detectActionType(tx);
      const description = tx.description || `${actionType} transaction on Solana`;

      const action = {
        type: actionType,
        details: description,
        signature: tx.signature?.slice(0, 16) + "...",
        timestamp: (tx.timestamp || Date.now() / 1000) * 1000,
        time: new Date((tx.timestamp || Date.now() / 1000) * 1000).toISOString(),
        auto: true, // flag to show this was auto-logged
      };

      // Save to Upstash under agent actions
      await redis(
        "LPUSH",
        `actions:${matchingAgent.id}`,
        encodeURIComponent(JSON.stringify(action))
      );

      // Keep only last 20 actions
      await redis("LTRIM", `actions:${matchingAgent.id}`, "0", "19");

      logged++;
    }

    return res.status(200).json({
      message: `Processed ${transactions.length} transactions, logged ${logged} agent actions`
    });

  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
