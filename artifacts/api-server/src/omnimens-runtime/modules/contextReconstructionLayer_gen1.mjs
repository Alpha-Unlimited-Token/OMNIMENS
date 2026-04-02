/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_3
 * Name: contextReconstructionLayer
 * Purpose: Reconstructs nuanced conversational context from compressed token windows.
 * Description: Reconstructs nuanced conversational context and generates hierarchical summaries for multi-agent utility.
 * Migrated: 2026-04-02T14:50:29.448Z
 */

// contextReconstructionLayer.mjs

import { createHash } from 'crypto';

/**
 * Utility function to hash strings for efficient context indexing.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function hashString(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Expands compressed token windows into coherent narratives using transformer-based attention.
 * @param {Array<string>} tokenWindows - Array of compressed token windows.
 * @param {number} maxContextSize - Maximum size of the reconstructed context.
 * @returns {string} - Reconstructed narrative.
 */
export function reconstructContext(tokenWindows, maxContextSize = 1024) {
  if (!Array.isArray(tokenWindows) || tokenWindows.some(t => typeof t !== 'string')) {
    throw new Error('Invalid input: tokenWindows must be an array of strings.');
  }

  const context = [];
  const attentionWeights = tokenWindows.map((_, i) => Math.exp(-i)); // Exponential decay for older windows.
  const totalWeight = attentionWeights.reduce((sum, w) => sum + w, 0);

  tokenWindows.forEach((window, i) => {
    const weight = attentionWeights[i] / totalWeight;
    const weightedTokens = window.split(' ').map(token => ({ token, weight }));
    context.push(...weightedTokens);
  });

  context.sort((a, b) => b.weight - a.weight); // Sort by descending weight.

  const reconstructed = [];
  let currentSize = 0;

  for (const { token } of context) {
    if (currentSize + token.length + 1 > maxContextSize) break;
    reconstructed.push(token);
    currentSize += token.length + 1;
  }

  return reconstructed.join(' ');
}

/**
 * Generates a hierarchical summary of a given text input.
 * @param {string} inputText - The input text to summarize.
 * @param {number} levels - Number of hierarchical levels to generate.
 * @returns {Array<string>} - Array of summaries, from highest to lowest level.
 */
export function generateHierarchicalSummary(inputText, levels = 3) {
  if (typeof inputText !== 'string' || levels <= 0) {
    throw new Error('Invalid input: inputText must be a string and levels must be a positive integer.');
  }

  const sentences = inputText.split('.').map(s => s.trim()).filter(Boolean);
  const summaries = [];

  for (let level = 0; level < levels; level++) {
    const step = Math.max(1, Math.floor(sentences.length / (levels - level)));
    const summary = sentences.filter((_, i) => i % step === 0).join('. ');
    summaries.push(summary);
  }

  return summaries;
}

/**
 * Utility function to compute attention weights for tokens.
 * @param {Array<string>} tokens - Array of tokens.
 * @returns {Array<number>} - Attention weights for each token.
 */
export function computeAttentionWeights(tokens) {
  if (!Array.isArray(tokens) || tokens.some(t => typeof t !== 'string')) {
    throw new Error('Invalid input: tokens must be an array of strings.');
  }

  const weights = tokens.map((_, i) => Math.exp(-i)); // Exponential decay for older tokens.
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  return weights.map(w => w / totalWeight);
}

/**
 * Combines multiple narratives into a unified context.
 * @param {Array<string>} narratives - Array of narrative strings.
 * @returns {string} - Unified context.
 */
export function unifyNarratives(narratives) {
  if (!Array.isArray(narratives) || narratives.some(n => typeof n !== 'string')) {
    throw new Error('Invalid input: narratives must be an array of strings.');
  }

  const combined = narratives.join(' ');
  return combined.replace(/\s+/g, ' ').trim();
}

/**
 * Splits text into token windows of a specified size.
 * @param {string} text - The input text to split.
 * @param {number} windowSize - The size of each token window.
 * @returns {Array<string>} - Array of token windows.
 */
export function splitIntoTokenWindows(text, windowSize = 128) {
  if (typeof text !== 'string' || windowSize <= 0) {
    throw new Error('Invalid input: text must be a string and windowSize must be a positive integer.');
  }

  const tokens = text.split(' ');
  const windows = [];

  for (let i = 0; i < tokens.length; i += windowSize) {
    windows.push(tokens.slice(i, i + windowSize).join(' '));
  }

  return windows;
}
