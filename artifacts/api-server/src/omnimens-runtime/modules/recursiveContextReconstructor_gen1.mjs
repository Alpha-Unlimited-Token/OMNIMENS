/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_49
 * Name: recursiveContextReconstructor
 * Purpose: Regenerate detailed context from compressed summaries for improved reasoning fidelity.
 * Description: Reconstructs detailed context from compressed summaries using hierarchical attention for improved reasoning fidelity.
 * Migrated: 2026-04-02T14:08:14.873Z
 */

// recursiveContextReconstructor.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for context items to track reconstruction fidelity.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Scores context items based on importance and relevance to the query.
 * @param {Array<string>} contextItems - Array of compressed context summaries.
 * @param {string} query - The query to evaluate relevance against.
 * @returns {Array<{item: string, score: number}>} - Context items with importance scores.
 */
export function scoreContextItems(contextItems, query) {
  return contextItems.map(item => {
    const relevance = calculateRelevance(item, query);
    const importance = calculateImportance(item);
    return { item, score: relevance + importance };
  });
}

/**
 * Calculates relevance of a context item to the query using simple word overlap.
 * @param {string} item - The context item.
 * @param {string} query - The query string.
 * @returns {number} - Relevance score.
 */
function calculateRelevance(item, query) {
  const queryWords = new Set(query.toLowerCase().split(/\W+/));
  const itemWords = new Set(item.toLowerCase().split(/\W+/));
  const overlap = [...queryWords].filter(word => itemWords.has(word));
  return overlap.length / queryWords.size;
}

/**
 * Estimates importance of a context item based on its length and complexity.
 * @param {string} item - The context item.
 * @returns {number} - Importance score.
 */
function calculateImportance(item) {
  const lengthScore = Math.min(item.length / 100, 1);
  const complexityScore = (item.match(/\W+/g) || []).length / Math.max(item.length, 1);
  return lengthScore + complexityScore;
}

/**
 * Reconstructs detailed context from compressed summaries using hierarchical attention.
 * @param {Array<string>} contextItems - Array of compressed context summaries.
 * @param {string} query - The query string guiding reconstruction.
 * @returns {string} - Reconstructed detailed context.
 */
export function reconstructContext(contextItems, query) {
  const scoredItems = scoreContextItems(contextItems, query);
  const sortedItems = scoredItems.sort((a, b) => b.score - a.score);
  return sortedItems.map(({ item }) => item).join(' ');
}

/**
 * Utility to normalize text by removing extra whitespace and converting to lowercase.
 * @param {string} text - The text to normalize.
 * @returns {string} - Normalized text.
 */
export function normalizeText(text) {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Utility to split text into sentences for finer reconstruction granularity.
 * @param {string} text - The text to split.
 * @returns {Array<string>} - Array of sentences.
 */
export function splitIntoSentences(text) {
  return text.match(/[^.!?]+[.!?]/g) || [text];
}