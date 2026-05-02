// upstash.js
// Handles persistent storage for agent registrations
// Uses Upstash Redis REST API — works directly from browser, no backend needed

const UPSTASH_URL = import.meta.env.VITE_UPSTASH_URL;
const UPSTASH_TOKEN = import.meta.env.VITE_UPSTASH_TOKEN;

/**
 * Makes a request to Upstash Redis REST API
 * @param {string} command - Redis command e.g. "SET", "GET", "LRANGE"
 * @param {Array} args - Command arguments
 * @returns {any} - Redis response
 */
async function redis(command, ...args) {
  const response = await fetch(`${UPSTASH_URL}/${command}/${args.join("/")}`, {
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
    },
  });
  const data = await response.json();
  return data.result;
}

/**
 * Save a new agent to persistent storage
 * Agents are stored as a Redis list under key "agents"
 * @param {object} agent - Agent object to save
 */
export async function saveAgent(agent) {
  try {
    // LPUSH adds to front of list — newest agents appear first
    await redis("LPUSH", "agents", encodeURIComponent(JSON.stringify(agent)));
    return true;
  } catch (error) {
    console.error("Failed to save agent:", error);
    return false;
  }
}

/**
 * Load all registered agents from persistent storage
 * @returns {Array} - Array of agent objects
 */
export async function loadAgents() {
  try {
    // LRANGE 0 -1 gets all items in the list
    const items = await redis("LRANGE", "agents", "0", "-1");
    if (!items || !Array.isArray(items)) return [];
    return items.map(item => JSON.parse(decodeURIComponent(item)));
  } catch (error) {
    console.error("Failed to load agents:", error);
    return [];
  }
}
