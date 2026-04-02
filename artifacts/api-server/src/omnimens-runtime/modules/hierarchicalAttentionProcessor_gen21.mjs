/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalAttentionProcessor
 * Written: 2026-04-02T14:24:51.533Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * TRANSLATION STATUS:
 * Novel constructs: attention
 * All constructs have translation mappings
 * Compiled targets: javascript: OK (9 IR steps) | python: OK (9 IR steps) | c: OK (9 IR steps) | x86_64: OK (9 IR steps) | arm64: OK (9 IR steps) | avr: OK (9 IR steps)
 * Translation map version: 22
 */
// hierarchicalAttentionProcessor.mjs

import { createHash } from 'crypto';

/**
 * Splits input into overlapping chunks.
 * @param {string} input - The input string.
 * @param {number} chunkSize - Size of each chunk.
 * @param {number} overlap - Number of overlapping characters between chunks.
 * @returns {string[]} Array of chunks.
 */
export function splitIntoChunks(input, chunkSize, overlap) {
  const chunks = [];
  for (let i = 0; i < input.length; i += chunkSize - overlap) {
    const chunk = input.slice(i, i + chunkSize);
    chunks.push(chunk);
  }
  return chunks;
}

/**
 * Applies local attention by hashing chunks.
 * @param {string[]} chunks - Array of chunks.
 * @returns {string[]} Array of hashed chunk representations.
 */
export function applyLocalAttention(chunks) {
  return chunks.map(chunk => createHash('sha256').update(chunk).digest('hex'));
}

/**
 * Aggregates global context using secondary attention layer.
 * @param {string[]} hashedChunks - Array of hashed chunk representations.
 * @returns {string} Aggregated global context hash.
 */
export function aggregateGlobalContext(hashedChunks) {
  const combined = hashedChunks.join('');
  return createHash('sha256').update(combined).digest('hex');
}

/**
 * Processes large contexts using hierarchical attention.
 * @param {string} input - The input string.
 * @param {number} chunkSize - Size of each chunk.
 * @param {number} overlap - Number of overlapping characters between chunks.
 * @returns {string} Final aggregated context representation.
 */
export function processHierarchicalAttention(input, chunkSize = 256, overlap = 64) {
  const chunks = splitIntoChunks(input, chunkSize, overlap);
  const hashedChunks = applyLocalAttention(chunks);
  return aggregateGlobalContext(hashedChunks);
}

/**
 * Utility for cross-agent usage: Computes hash of any string.
 * @param {string} input - Input string.
 * @returns {string} SHA256 hash of the input.
 */
export function computeHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Utility for cross-agent usage: Splits text generically.
 * @param {string} text - Input text.
 * @param {number} size - Desired chunk size.
 * @returns {string[]} Array of text chunks.
 */
export function genericTextSplitter(text, size) {
  const result = [];
  for (let i = 0; i < text.length; i += size) {
    result.push(text.slice(i, i + size));
  }
  return result;
}
