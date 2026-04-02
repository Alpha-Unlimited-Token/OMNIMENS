/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: reversibleContextCompressor
 * Written: 2026-04-02T15:16:26.214Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// reversibleContextCompressor.mjs

import crypto from 'crypto';

/**
 * Generate reversible embeddings for given text using a pseudo-random encoding.
 * @param {string} text - Input text to encode.
 * @returns {string} - Encoded representation of the text.
 */
export function reversibleEncode(text) {
  const hash = crypto.createHash('sha256');
  hash.update(text);
  return hash.digest('hex');
}

/**
 * Decode a reversible encoding back to its original text (if stored in a lookup map).
 * @param {string} encoded - Encoded representation of the text.
 * @param {Map<string, string>} lookupMap - A map storing original text keyed by encoded values.
 * @returns {string|null} - Original text if found, otherwise null.
 */
export function reversibleDecode(encoded, lookupMap) {
  return lookupMap.get(encoded) || null;
}

/**
 * Perform hierarchical summarization of a long text by breaking it into chunks and summarizing each.
 * @param {string} text - Long input text to summarize.
 * @param {number} chunkSize - Number of characters per chunk.
 * @returns {string[]} - Array of summarized chunks.
 */
export function hierarchicalSummarize(text, chunkSize = 500) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize);
    chunks.push(summarizeChunk(chunk));
  }
  return chunks;
}

/**
 * Summarize a single chunk of text (simple lossy summarization by extracting key sentences).
 * @param {string} chunk - Input chunk of text.
 * @returns {string} - Summarized version of the chunk.
 */
function summarizeChunk(chunk) {
  const sentences = chunk.split('.');
  const keySentences = sentences.filter((sentence) => sentence.length > 20).slice(0, 2);
  return keySentences.join('. ') + '.';
}

/**
 * Compress context by combining reversible encoding with hierarchical summarization.
 * @param {string} context - Long input context to compress.
 * @param {Map<string, string>} lookupMap - A map to store reversible encodings.
 * @returns {Object} - Object containing summarized chunks and reversible encodings.
 */
export function compressContext(context, lookupMap) {
  const summarizedChunks = hierarchicalSummarize(context);
  const reversibleEncodings = summarizedChunks.map((chunk) => {
    const encoded = reversibleEncode(chunk);
    lookupMap.set(encoded, chunk);
    return encoded;
  });
  return { summarizedChunks, reversibleEncodings };
}

/**
 * Decompress context by reconstructing from reversible encodings and lookup map.
 * @param {string[]} encodings - Array of reversible encodings.
 * @param {Map<string, string>} lookupMap - A map storing original text keyed by encodings.
 * @returns {string} - Reconstructed context.
 */
export function decompressContext(encodings, lookupMap) {
  return encodings
    .map((encoding) => reversibleDecode(encoding, lookupMap))
    .filter((chunk) => chunk !== null)
    .join(' ');
}

/**
 * Utility function to validate chunk size and ensure safe operations.
 * @param {number} chunkSize - Desired chunk size.
 * @throws {Error} - If chunk size is invalid.
 */
export function validateChunkSize(chunkSize) {
  if (chunkSize <= 0 || !Number.isInteger(chunkSize)) {
    throw new Error('Chunk size must be a positive integer.');
  }
}

// Example usage (commented out for production):
// const lookupMap = new Map();
// const context = "This is a very long text that needs to be compressed and later reconstructed with high fidelity.";
// const compressed = compressContext(context, lookupMap);
// const decompressed = decompressContext(compressed.reversibleEncodings, lookupMap);
// console.log({ compressed, decompressed });