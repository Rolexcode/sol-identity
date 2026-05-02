// cache.js
// In-memory cache for RPC call results
// Prevents duplicate calls for the same wallet/domain
// TTL (time to live) = 5 minutes by default

const store = new Map();

/**
 * Get a cached value by key
 * Returns null if not found or expired
 * @param {string} key
 * @returns {any|null}
 */
export function getCache(key) {
  const item = store.get(key);
  if (!item) return null;

  // Check if expired
  if (Date.now() > item.expiry) {
    store.delete(key);
    return null;
  }

  return item.value;
}

/**
 * Set a value in cache with TTL
 * @param {string} key
 * @param {any} value
 * @param {number} ttl - Time to live in ms (default 5 minutes)
 */
export function setCache(key, value, ttl = 5 * 60 * 1000) {
  store.set(key, {
    value,
    expiry: Date.now() + ttl,
  });
}

/**
 * Clear a specific key from cache
 * @param {string} key
 */
export function clearCache(key) {
  store.delete(key);
}

/**
 * Clear all cached values
 */
export function clearAllCache() {
  store.clear();
}
