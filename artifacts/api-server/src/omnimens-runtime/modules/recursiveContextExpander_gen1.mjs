/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_24
 * Name: recursiveContextExpander
 * Purpose: Reconstructs compressed context dynamically during reasoning to retain hierarchical detail.
 * Description: Dynamically reconstructs and refines hierarchical context using query relevance and reasoning depth.
 * Migrated: 2026-04-02T14:08:14.877Z
 */

// recursiveContextExpander.mjs

import crypto from 'crypto';

/**
 * Expands compressed context dynamically using hierarchical attention and query relevance.
 * @param {Array} contextHierarchy - Array of context levels, each level is an array of strings.
 * @param {string} query - The query to guide context re-expansion.
 * @param {number} depth - Depth of reasoning to expand context.
 * @returns {Array} - Reconstructed context relevant to the query.
 */
export function expandContext(contextHierarchy, query, depth) {
  if (!Array.isArray(contextHierarchy) || typeof query !== 'string' || typeof depth !== 'number') {
    throw new TypeError('Invalid input types. Expected (Array, string, number).');
  }

  const relevanceScores = contextHierarchy.map(level => {
    return level.map(item => {
      return { item, score: calculateRelevance(item, query) };
    });
  });

  const expandedContext = [];
  for (let i = 0; i < Math.min(depth, relevanceScores.length); i++) {
    const sortedLevel = relevanceScores[i].sort((a, b) => b.score - a.score);
    expandedContext.push(...sortedLevel.map(entry => entry.item));
  }

  return expandedContext;
}

/**
 * Calculates relevance of a context item to a query using a simple similarity metric.
 * @param {string} contextItem - The context item to evaluate.
 * @param {string} query - The query to compare against.
 * @returns {number} - Relevance score (higher is more relevant).
 */
export function calculateRelevance(contextItem, query) {
  const contextWords = contextItem.split(/\s+/);
  const queryWords = query.split(/\s+/);

  const commonWords = queryWords.filter(word => contextWords.includes(word));
  return commonWords.length / Math.sqrt(contextWords.length * queryWords.length);
}

/**
 * Generates a unique hash for a given context and query to cache results.
 * @param {Array} contextHierarchy - Array of context levels.
 * @param {string} query - The query string.
 * @returns {string} - A unique hash string.
 */
export function generateContextHash(contextHierarchy, query) {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(contextHierarchy));
  hash.update(query);
  return hash.digest('hex');
}

/**
 * Filters context to remove duplicates while preserving order.
 * @param {Array} context - Array of context items.
 * @returns {Array} - Deduplicated context.
 */
export function deduplicateContext(context) {
  const seen = new Set();
  return context.filter(item => {
    if (seen.has(item)) return false;
    seen.add(item);
    return true;
  });
}

/**
 * Utility to normalize context items (e.g., trimming whitespace, converting to lowercase).
 * @param {Array} context - Array of context items.
 * @returns {Array} - Normalized context.
 */
export function normalizeContext(context) {
  return context.map(item => item.trim().toLowerCase());
}

/**
 * Combines all utility functions to dynamically expand and refine context.
 * @param {Array} contextHierarchy - Array of context levels.
 * @param {string} query - The query to guide expansion.
 * @param {number} depth - Depth of reasoning.
 * @returns {Array} - Final expanded and refined context.
 */
export function processContext(contextHierarchy, query, depth) {
  const normalizedHierarchy = contextHierarchy.map(normalizeContext);
  const expanded = expandContext(normalizedHierarchy, query, depth);
  return deduplicateContext(expanded);
}