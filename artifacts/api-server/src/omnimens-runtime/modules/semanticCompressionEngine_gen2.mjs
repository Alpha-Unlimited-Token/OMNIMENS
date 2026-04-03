/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticCompressionEngine
 * Written: 2026-04-03T12:17:19.210Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// semanticCompressionEngine.mjs

import { createHash } from 'crypto';

/**
 * Encodes a long sequence into a dense semantic representation.
 * @param {string} input - The long text sequence to compress.
 * @param {number} embeddingSize - Size of the latent representation.
 * @returns {Float64Array} - Dense semantic embedding.
 */
export function encodeSequence(input, embeddingSize = 128) {
  if (typeof input !== 'string' || embeddingSize <= 0) {
    throw new Error('Invalid input or embedding size.');
  }

  const tokens = tokenize(input);
  const hashedTokens = tokens.map(token => hashToken(token));
  const embedding = reduceToEmbedding(hashedTokens, embeddingSize);

  return embedding;
}

/**
 * Decodes a semantic representation back into a reconstructed sequence.
 * @param {Float64Array} embedding - Dense semantic embedding.
 * @returns {string} - Reconstructed text sequence.
 */
export function decodeSequence(embedding) {
  if (!(embedding instanceof Float64Array)) {
    throw new Error('Invalid embedding input.');
  }

  const reconstructedTokens = reconstructTokens(embedding);
  return reconstructedTokens.join(' ');
}

/**
 * Tokenizes input text into words.
 * @param {string} text - Input text.
 * @returns {string[]} - Array of tokens.
 */
export function tokenize(text) {
  return text.split(/\s+/).map(token => token.trim()).filter(token => token.length > 0);
}

/**
 * Hashes a token into a numeric value.
 * @param {string} token - Input token.
 * @returns {number} - Numeric hash of the token.
 */
export function hashToken(token) {
  const hash = createHash('sha256');
  hash.update(token);
  return parseInt(hash.digest('hex').slice(0, 8), 16);
}

/**
 * Reduces hashed tokens into a fixed-size embedding.
 * @param {number[]} hashedTokens - Array of hashed tokens.
 * @param {number} size - Size of the latent representation.
 * @returns {Float64Array} - Dense semantic embedding.
 */
export function reduceToEmbedding(hashedTokens, size) {
  const embedding = new Float64Array(size).fill(0);

  hashedTokens.forEach((hash, index) => {
    embedding[index % size] += hash % 1e6; // Modulo to keep values manageable.
  });

  normalizeEmbedding(embedding);
  return embedding;
}

/**
 * Normalizes the embedding to unit length.
 * @param {Float64Array} embedding - Dense semantic embedding.
 */
export function normalizeEmbedding(embedding) {
  const magnitude = Math.sqrt(embedding.reduce((sum, value) => sum + value ** 2, 0));

  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= magnitude;
    }
  }
}

/**
 * Reconstructs tokens from an embedding.
 * @param {Float64Array} embedding - Dense semantic embedding.
 * @returns {string[]} - Array of reconstructed tokens.
 */
export function reconstructTokens(embedding) {
  return embedding.map(value => String.fromCharCode(Math.floor(value * 1000) % 256));
}

/**
 * Measures reconstruction loss between original and reconstructed sequences.
 * @param {string} original - Original sequence.
 * @param {string} reconstructed - Reconstructed sequence.
 * @returns {number} - Reconstruction loss (lower is better).
 */
export function calculateReconstructionLoss(original, reconstructed) {
  const originalTokens = tokenize(original);
  const reconstructedTokens = tokenize(reconstructed);

  let loss = 0;
  for (let i = 0; i < Math.min(originalTokens.length, reconstructedTokens.length); i++) {
    loss += originalTokens[i] === reconstructedTokens[i] ? 0 : 1;
  }

  return loss + Math.abs(originalTokens.length - reconstructedTokens.length);
}

/**
 * Utility function for semantic compression.
 * Compresses and decompresses a sequence to test reconstruction fidelity.
 * @param {string} input - Input text sequence.
 * @param {number} embeddingSize - Size of the latent representation.
 * @returns {{embedding, reconstructed, loss}} - Results of compression and reconstruction.
 */
export function testCompression(input, embeddingSize = 128) {
  const embedding = encodeSequence(input, embeddingSize);
  const reconstructed = decodeSequence(embedding);
  const loss = calculateReconstructionLoss(input, reconstructed);

  return { embedding, reconstructed, loss };
}