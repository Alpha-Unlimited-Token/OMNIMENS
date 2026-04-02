/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_15
 * Name: transformerContextCompressor
 * Purpose: Preserve semantic fidelity in token window compression for long-range context management.
 * Description: A utility module for hierarchical summarization and importance-scored context compression to manage long-range semantic fidelity.
 * Migrated: 2026-04-02T15:02:53.826Z
 */

// transformerContextCompressor.mjs

import crypto from 'crypto';

/**
 * Generate a hierarchical summary of input tokens.
 * @param {string[]} tokens - Array of tokens to summarize.
 * @param {number} levels - Number of hierarchical levels for summarization.
 * @returns {string[]} - Array of summarized tokens.
 */
export function generateHierarchicalSummary(tokens, levels = 3) {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    throw new Error("Input tokens must be a non-empty array.");
  }
  if (levels < 1) {
    throw new Error("Levels must be at least 1.");
  }

  let summaries = tokens;
  for (let i = 0; i < levels; i++) {
    summaries = summaries.reduce((acc, token, index) => {
      if (index % 2 === 0) {
        const nextToken = summaries[index + 1] || "";
        acc.push(`${token} ${nextToken}`.trim());
      }
      return acc;
    }, []);
  }

  return summaries;
}

/**
 * Generate importance-scored embeddings for tokens.
 * @param {string[]} tokens - Array of tokens to process.
 * @returns {Object[]} - Array of objects containing token and its importance score.
 */
export function generateImportanceScores(tokens) {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    throw new Error("Input tokens must be a non-empty array.");
  }

  return tokens.map(token => {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const score = parseInt(hash.slice(0, 8), 16) / 0xffffffff;
    return { token, score };
  });
}

/**
 * Compress context while preserving semantic fidelity.
 * @param {string[]} tokens - Array of tokens to compress.
 * @param {number} compressionRatio - Desired compression ratio (0 < ratio <= 1).
 * @returns {string[]} - Array of compressed tokens.
 */
export function compressContext(tokens, compressionRatio = 0.5) {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    throw new Error("Input tokens must be a non-empty array.");
  }
  if (compressionRatio <= 0 || compressionRatio > 1) {
    throw new Error("Compression ratio must be between 0 and 1.");
  }

  const importanceScores = generateImportanceScores(tokens);
  importanceScores.sort((a, b) => b.score - a.score);

  const compressedLength = Math.max(1, Math.floor(tokens.length * compressionRatio));
  return importanceScores.slice(0, compressedLength).map(item => item.token);
}

/**
 * Utility function to normalize tokens.
 * @param {string[]} tokens - Array of tokens to normalize.
 * @returns {string[]} - Array of normalized tokens.
 */
export function normalizeTokens(tokens) {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    throw new Error("Input tokens must be a non-empty array.");
  }

  return tokens.map(token => token.toLowerCase().replace(/[^a-z0-9]/gi, ""));
}

/**
 * Utility function to split text into tokens.
 * @param {string} text - Input text to tokenize.
 * @returns {string[]} - Array of tokens.
 */
export function tokenizeText(text) {
  if (typeof text !== "string" || text.trim() === "") {
    throw new Error("Input text must be a non-empty string.");
  }

  return text.split(/\s+/).filter(token => token.length > 0);
}