// upstash.js
// Handles persistent storage for agent registrations and action logs
// Uses Upstash Redis REST API — works directly from browser

const UPSTASH_URL = import.meta.env.VITE_UPSTASH_URL;
const UPSTASH_TOKEN = import.meta.env.VITE_UPSTASH_TOKEN;

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
 * Save a new agent to persistent storage
 * @param {object} agent
 */
export async function saveAgent(agent) {
  try {
    await redis("LPUSH", "agents", encodeURIComponent(JSON.stringify(agent)));
    return true;
  } catch (error) {
    console.error("Failed to save agent:", error);
    return false;
  }
}

/**
 * Load all registered agents
 * @returns {Array}
 */
export async function loadAgents() {
  try {
    const items = await redis("LRANGE", "agents", "0", "-1");
    if (!items || !Array.isArray(items)) return [];
    return items.map(item => JSON.parse(decodeURIComponent(item)));
  } catch (error) {
    console.error("Failed to load agents:", error);
    return [];
  }
}

/**
 * Log an action for a specific agent
 * Actions are stored under key "actions:{agentId}"
 * @param {string} agentId - The agent ID
 * @param {object} action - { type, details, timestamp }
 */
export async function logAgentAction(agentId, action) {
  try {
    const entry = {
      ...action,
      timestamp: Date.now(),
      time: new Date().toISOString(),
    };
    await redis(
      "LPUSH",
      `actions:${agentId}`,
      encodeURIComponent(JSON.stringify(entry))
    );
    // Keep only last 20 actions per agent
    await redis("LTRIM", `actions:${agentId}`, "0", "19");
    return true;
  } catch (error) {
    console.error("Failed to log action:", error);
    return false;
  }
}

/**
 * Load action history for a specific agent
 * @param {string} agentId
 * @returns {Array}
 */
export async function loadAgentActions(agentId) {
  try {
    const items = await redis("LRANGE", `actions:${agentId}`, "0", "-1");
    if (!items || !Array.isArray(items)) return [];
    return items.map(item => JSON.parse(decodeURIComponent(item)));
  } catch (error) {
    console.error("Failed to load actions:", error);
    return [];
  }
}
