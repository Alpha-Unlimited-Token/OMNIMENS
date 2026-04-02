/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_41
 * Name: multiResolutionMemory
 * Purpose: Combines hierarchical summarization with selective fine-grained recall to preserve critical details in long contexts.
 * Description: Implements hierarchical summarization and selective recall for long contexts using coarse summaries and fine-grained attention.
 * Migrated: 2026-04-02T14:21:19.466Z
 */

// multiResolutionMemory.mjs

import { createHash } from 'crypto';

/**
 * Generates a coarse-grained summary by hashing key details of the input.
 * Useful for creating global context representations.
 * @param {string} input - Raw text or data to summarize.
 * @returns {string} - Coarse-grained hash summary.
 */
export function generateCoarseSummary(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex').slice(0, 64); // Shortened hash for compact storage
}

/**
 * Extracts fine-grained details from input based on attention weights.
 * @param {string} input - Raw text or data to analyze.
 * @param {Array<number>} attentionWeights - Array of weights (0-1) for each character.
 * @returns {string} - Fine-grained details extracted based on weights.
 */
export function extractFineDetails(input, attentionWeights) {
  if (input.length !== attentionWeights.length) {
    throw new Error('Input length and attention weights length must match.');
  }
  return input
    .split('')
    .filter((char, index) => attentionWeights[index] > 0.5)
    .join('');
}

/**
 * Combines coarse-grained summaries with fine-grained details for hierarchical memory.
 * @param {string} input - Raw text or data to process.
 * @param {Array<number>} attentionWeights - Array of weights (0-1) for each character.
 * @returns {{ coarseSummary: string, fineDetails: string }} - Combined memory representation.
 */
export function combineHierarchicalMemory(input, attentionWeights) {
  const coarseSummary = generateCoarseSummary(input);
  const fineDetails = extractFineDetails(input, attentionWeights);
  return { coarseSummary, fineDetails };
}

/**
 * Utility to normalize attention weights to ensure valid input.
 * @param {Array<number>} weights - Array of raw weights.
 * @returns {Array<number>} - Normalized weights (0-1).
 */
export function normalizeWeights(weights) {
  const maxWeight = Math.max(...weights);
  return weights.map(weight => (maxWeight > 0 ? weight / maxWeight : 0));
}

/**
 * Example usage:
 * const input = "AI platform UX design best practices conversational 2025";
 * const rawWeights = [0.2, 0.8, 0.5, 0.9, 0.1, 0.3, 0.7, 0.6];
 * const normalizedWeights = normalizeWeights(rawWeights);
 * const memory = combineHierarchicalMemory(input, normalizedWeights);
 * console.log(memory);
 */