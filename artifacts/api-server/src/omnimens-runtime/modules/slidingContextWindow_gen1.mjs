/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_2
 * Name: slidingContextWindow
 * Purpose: Maintain coherence in extended conversations by dynamically managing the token window.
 * Description: Manages token context windows dynamically by prioritizing and retaining the most relevant tokens for extended conversation coherence.
 * Migrated: 2026-04-03T16:17:17.108Z
 */

// slidingContextWindow.mjs

import { createHash } from 'crypto';

/**
 * Hashes a string using SHA-256 to create a unique identifier for tokens.
 * @param {string} input - The input string to hash.
 * @returns {string} - The hashed output.
 */
export function hashToken(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Calculates the relevance score of a token based on its frequency and position.
 * @param {number} frequency - The frequency of the token.
 * @param {number} position - The position of the token in the context window.
 * @returns {number} - The computed relevance score.
 */
export function calculateRelevance(frequency, position) {
  return frequency / (position + 1);
}

/**
 * Dynamically manages the token window by retaining the most relevant tokens.
 * @param {Array<string>} tokens - Array of tokens in the current context window.
 * @param {number} maxTokens - Maximum number of tokens to retain in the window.
 * @returns {Array<string>} - Array of prioritized tokens.
 */
export function slidingContextWindow(tokens, maxTokens) {
  const tokenMap = new Map();

  // Count frequency of each token
  tokens.forEach((token, index) => {
    const hashedToken = hashToken(token);
    const entry = tokenMap.get(hashedToken) || { frequency: 0, positions: [] };
    entry.frequency++;
    entry.positions.push(index);
    tokenMap.set(hashedToken, entry);
  });

  // Compute relevance scores for each token
  const scoredTokens = Array.from(tokenMap.entries()).map(([hashedToken, data]) => {
    const avgPosition = data.positions.reduce((sum, pos) => sum + pos, 0) / data.positions.length;
    const relevance = calculateRelevance(data.frequency, avgPosition);
    return { hashedToken, token: tokens[data.positions[0]], relevance };
  });

  // Sort tokens by relevance
  scoredTokens.sort((a, b) => b.relevance - a.relevance);

  // Retain top tokens within the maxTokens limit
  return scoredTokens.slice(0, maxTokens).map(entry => entry.token);
}

/**
 * Utility to split a long text into tokens based on whitespace.
 * @param {string} text - The input text to tokenize.
 * @returns {Array<string>} - Array of tokens.
 */
export function tokenizeText(text) {
  return text.split(/\s+/).filter(Boolean);
}

/**
 * Utility to reconstruct text from tokens.
 * @param {Array<string>} tokens - Array of tokens to reconstruct.
 * @returns {string} - Reconstructed text.
 */
export function reconstructText(tokens) {
  return tokens.join(' ');
}

/**
 * Example usage of the slidingContextWindow function.
 * @param {string} text - Input text to process.
 * @param {number} maxTokens - Maximum number of tokens to retain.
 * @returns {string} - Processed text with prioritized tokens.
 */
export function processTextWithSlidingWindow(text, maxTokens) {
  const tokens = tokenizeText(text);
  const prioritizedTokens = slidingContextWindow(tokens, maxTokens);
  return reconstructText(prioritizedTokens);
}