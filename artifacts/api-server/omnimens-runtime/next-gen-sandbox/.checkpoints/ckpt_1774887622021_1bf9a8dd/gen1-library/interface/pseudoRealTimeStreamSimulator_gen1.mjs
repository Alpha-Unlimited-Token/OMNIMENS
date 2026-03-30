/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: pseudoRealTimeStreamSimulator
 * Purpose: Simulates real-time data streams by periodically fetching and caching data from APIs.
 * Description: Simulates real-time data streams by periodically fetching and caching API data with TTL expiration, providing query access to the latest data.
 * Migrated: 2026-03-25T22:49:34.130Z
 */

// pseudoRealTimeStreamSimulator.mjs
import { setTimeout } from 'timers/promises';
import crypto from 'crypto';

// In-memory cache with TTL expiration
const cache = new Map();

/**
 * Fetch data from an API endpoint.
 * @param {string} url - The API URL.
 * @returns {Promise<any>} - The fetched data.
 */
export async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Store data in the cache with a TTL.
 * @param {string} key - Cache key.
 * @param {any} value - Data to store.
 * @param {number} ttl - Time-to-live in milliseconds.
 */
export function cacheData(key, value, ttl) {
  const expiration = Date.now() + ttl;
  cache.set(key, { value, expiration });
}

/**
 * Retrieve data from the cache if valid.
 * @param {string} key - Cache key.
 * @returns {any|null} - Cached data or null if expired/not found.
 */
export function getCachedData(key) {
  const entry = cache.get(key);
  if (entry && entry.expiration > Date.now()) {
    return entry.value;
  }
  cache.delete(key);
  return null;
}

/**
 * Simulate real-time data fetching and caching.
 * @param {string} url - API URL.
 * @param {number} interval - Fetch interval in milliseconds.
 * @param {number} ttl - Cache TTL in milliseconds.
 */
export async function simulateRealTimeStream(url, interval, ttl) {
  while (true) {
    try {
      const data = await fetchData(url);
      const cacheKey = crypto.createHash('sha256').update(url).digest('hex');
      cacheData(cacheKey, data, ttl);
    } catch (error) {
      console.error(`Error fetching data: ${error.message}`);
    }
    await setTimeout(interval);
  }
}

/**
 * Query the latest cached data for a given URL.
 * @param {string} url - API URL.
 * @returns {any|null} - Latest cached data or null.
 */
export function queryLatestData(url) {
  const cacheKey = crypto.createHash('sha256').update(url).digest('hex');
  return getCachedData(cacheKey);
}

/**
 * Clear expired cache entries.
 */
export function clearExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (entry.expiration <= now) {
      cache.delete(key);
    }
  }
}

/**
 * Utility for testing cache status.
 * @returns {Array} - List of active cache keys and their expiration times.
 */
export function getCacheStatus() {
  return Array.from(cache.entries()).map(([key, entry]) => ({ key, expiration: entry.expiration }));
}