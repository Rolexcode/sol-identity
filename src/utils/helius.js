// helius.js
// Manages Helius webhook addresses programmatically
// Only called when a verified agent registers — prevents credit spam

const HELIUS_API_KEY = import.meta.env.VITE_HELIUS_API_KEY;
const HELIUS_WEBHOOK_ID = import.meta.env.VITE_HELIUS_WEBHOOK_ID;

/**
 * Adds a wallet address to the Helius webhook
 * Only called for ON-CHAIN VERIFIED agents
 * @param {string} walletAddress - Full wallet address to monitor
 * @returns {boolean} - Success or failure
 */
export async function addWalletToWebhook(walletAddress) {
  try {
    // First get current addresses
    const getResponse = await fetch(
      `https://api.helius.xyz/v0/webhooks/${HELIUS_WEBHOOK_ID}?api-key=${HELIUS_API_KEY}`
    );
    const webhook = await getResponse.json();
    const currentAddresses = webhook.accountAddresses || [];

    // Don't add duplicates
    if (currentAddresses.includes(walletAddress)) return true;

    // Add new address to existing list
    const updatedAddresses = [...currentAddresses, walletAddress];

    // Update webhook with new address list
    const updateResponse = await fetch(
      `https://api.helius.xyz/v0/webhooks/${HELIUS_WEBHOOK_ID}?api-key=${HELIUS_API_KEY}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookURL: "https://sol-identity.vercel.app/api/webhook",
          transactionTypes: ["Any"],
          accountAddresses: updatedAddresses,
          webhookType: "enhanced",
        }),
      }
    );

    return updateResponse.ok;
  } catch (error) {
    console.error("Failed to add wallet to webhook:", error);
    return false;
  }
}
