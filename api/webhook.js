// api/webhook.js
// Vercel serverless function
// Receives Helius webhook transactions and logs them to agent action history

const UPSTASH_URL = process.env.VITE_UPSTASH_URL;
const UPSTASH_TOKEN = process.env.VITE_UPSTASH_TOKEN;

async function redis(command, ...args) {
  const response = await fetch(
    `${UPSTASH_URL}/${command}/${args.join("/")}`,
    {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    }
  );
  const data = await response.json();
  return data.result;
}

function detectActionType(transaction) {
  const type = transaction.type || "";
  const description = (transaction.description || "").toLowerCase();
  if (type === "SWAP" || description.includes("swap")) return "Swap";
  if (type === "TRANSFER" || description.includes("transfer")) return "Transfer";
  if (description.includes("nft")) return "NFT Sale";
  if (description.includes("stake") && !description.includes("unstake")) return "Stake";
  if (description.includes("unstake")) return "Unstake";
  if (description.includes("vote")) return "Vote";
  if (description.includes("mint")) return "Mint";
  return "Transaction";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const transactions = req.body;
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(200).json({ message: "No transactions" });
    }

    const agentItems = await redis("LRANGE", "agents", "0", "-1");
    const agents = agentItems
      ? agentItems.map(item => JSON.parse(decodeURIComponent(item)))
      : [];

    let logged = 0;

    for (const tx of transactions) {
      const feePayer = tx.feePayer;
      if (!feePayer) continue;

      // Match by full wallet address if available
      // Fallback to prefix matching for older entries
      const matchingAgent = agents.find(agent => {
        if (!agent.agentWallet || agent.agentWallet === "Not provided") return false;

        // Full wallet match — most accurate
        if (agent.agentWalletFull) {
          return agent.agentWalletFull === feePayer;
        }

        // Prefix match fallback
        const storedPrefix = agent.agentWallet.split("...")[0];
        return feePayer.startsWith(storedPrefix);
      });

      if (!matchingAgent) continue;

      const action = {
        type: detectActionType(tx),
        details: tx.description || "Transaction on Solana",
        signature: tx.signature ? tx.signature.slice(0, 16) + "..." : "unknown",
        timestamp: (tx.timestamp || Date.now() / 1000) * 1000,
        time: new Date((tx.timestamp || Date.now() / 1000) * 1000).toISOString(),
        auto: true,
      };

      await redis(
        "LPUSH",
        `actions:${matchingAgent.id}`,
        encodeURIComponent(JSON.stringify(action))
      );
      await redis("LTRIM", `actions:${matchingAgent.id}`, "0", "19");
      logged++;
    }

    return res.status(200).json({ logged });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
