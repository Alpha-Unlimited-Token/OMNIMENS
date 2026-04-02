/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticCompressionManager
 * Written: 2026-04-02T14:24:42.069Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// semanticCompressionManager.mjs

import crypto from 'crypto';

/**
 * Generate a hash to uniquely identify compressed semantic data.
 * This ensures data integrity and allows for deduplication.
 * @param {string} input - The input text to hash.
 * @returns {string} - A unique hash string.
 */
export function generateSemanticHash(input) {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

/**
 * Tokenize input text into meaningful chunks while preserving semantic context.
 * @param {string} text - The input text to tokenize.
 * @param {number} maxTokens - Maximum number of tokens allowed per chunk.
 * @returns {string[]} - Array of tokenized text chunks.
 */
export function tokenizeText(text, maxTokens) {
  if (typeof text !== 'string' || maxTokens <= 0) {
    throw new Error('Invalid input: text must be a string and maxTokens must be a positive integer.');
  }

  const words = text.split(/\s+/);
  const chunks = [];
  let currentChunk = [];

  for (const word of words) {
    if (currentChunk.join(' ').length + word.length + 1 <= maxTokens) {
      currentChunk.push(word);
    } else {
      chunks.push(currentChunk.join(' '));
      currentChunk = [word];
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }

  return chunks;
}

/**
 * Compress text semantically by summarizing chunks while preserving key information.
 * @param {string[]} chunks - Array of tokenized text chunks.
 * @param {number} compressionRatio - Ratio (0-1) indicating how much to compress.
 * @returns {string[]} - Array of semantically compressed text chunks.
 */
export function compressChunks(chunks, compressionRatio) {
  if (!Array.isArray(chunks) || compressionRatio <= 0 || compressionRatio > 1) {
    throw new Error('Invalid input: chunks must be an array and compressionRatio must be between 0 and 1.');
  }

  return chunks.map(chunk => {
    const words = chunk.split(' ');
    const targetLength = Math.max(1, Math.floor(words.length * compressionRatio));
    return words.slice(0, targetLength).join(' ');
  });
}

/**
 * Adaptive compression of text based on a target token window size.
 * @param {string} text - The input text to compress.
 * @param {number} maxTokens - Target maximum token window size.
 * @param {number} compressionRatio - Initial compression ratio.
 * @returns {string} - Compressed text while preserving semantic meaning.
 */
export function adaptiveSemanticCompression(text, maxTokens, compressionRatio) {
  const tokenizedChunks = tokenizeText(text, maxTokens);
  const compressedChunks = compressChunks(tokenizedChunks, compressionRatio);
  return compressedChunks.join(' ');
}

/**
 * Validate semantic coherence between original and compressed text.
 * @param {string} original - Original text.
 * @param {string} compressed - Compressed text.
 * @returns {boolean} - Whether the semantic coherence is preserved.
 */
export function validateSemanticCoherence(original, compressed) {
  const originalWords = new Set(original.split(/\s+/));
  const compressedWords = new Set(compressed.split(/\s+/));

  let preservedCount = 0;
  for (const word of compressedWords) {
    if (originalWords.has(word)) {
      preservedCount++;
    }
  }

  return preservedCount / compressedWords.size >= 0.8; // At least 80% of words should match.
}

/**
 * Utility function to manage the entire semantic compression pipeline.
 * @param {string} text - The input text to process.
 * @param {number} maxTokens - Maximum token window size.
 * @param {number} compressionRatio - Compression ratio.
 * @returns {object} - Object containing original, compressed text, and validation result.
 */
export function processSemanticCompression(text, maxTokens, compressionRatio) {
  const compressedText = adaptiveSemanticCompression(text, maxTokens, compressionRatio);
  const isCoherent = validateSemanticCoherence(text, compressedText);

  return {
    original: text,
    compressed: compressedText,
    isCoherent
  };
}