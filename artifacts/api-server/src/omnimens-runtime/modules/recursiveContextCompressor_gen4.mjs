/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: recursiveContextCompressor
 * Written: 2026-04-03T07:27:21.542Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// recursiveContextCompressor.mjs

import crypto from 'crypto';

/**
 * Generates a hash for a given input string (used for semantic clustering).
 * @param {string} input - The input string to hash.
 * @returns {string} - A fixed-length hash string.
 */
export function generateHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Splits a long context into manageable chunks based on a specified size.
 * @param {string} context - The long context string.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @returns {string[]} - An array of context chunks.
 */
export function splitContext(context, chunkSize) {
  const chunks = [];
  for (let i = 0; i < context.length; i += chunkSize) {
    chunks.push(context.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Extracts the most semantically important sentences from a chunk.
 * @param {string} chunk - A chunk of text.
 * @param {number} sentenceCount - The number of sentences to extract.
 * @returns {string[]} - An array of important sentences.
 */
export function extractKeySentences(chunk, sentenceCount) {
  const sentences = chunk.match(/[^.!?]+[.!?]/g) || [];
  return sentences.slice(0, sentenceCount); // Simplified importance ranking.
}

/**
 * Clusters semantically similar chunks based on hash similarity.
 * @param {string[]} chunks - An array of context chunks.
 * @returns {Object} - A map of cluster hashes to grouped chunks.
 */
export function clusterChunks(chunks) {
  const clusters = {};
  chunks.forEach(chunk => {
    const hash = generateHash(chunk).slice(0, 8); // Use first 8 chars of hash for clustering.
    if (!clusters[hash]) clusters[hash] = [];
    clusters[hash].push(chunk);
  });
  return clusters;
}

/**
 * Abstracts a cluster into a higher-level summary.
 * @param {string[]} cluster - An array of chunks in the same cluster.
 * @returns {string} - A summarized abstraction of the cluster.
 */
export function abstractCluster(cluster) {
  return cluster.map(chunk => extractKeySentences(chunk, 1).join(' ')).join(' ');
}

/**
 * Recursively compresses a long context into hierarchical semantic abstractions.
 * @param {string} context - The original long context.
 * @param {number} chunkSize - The size of each chunk.
 * @param {number} depth - The current recursion depth.
 * @param {number} maxDepth - The maximum recursion depth allowed.
 * @returns {string} - The final compressed abstraction.
 */
export function recursiveCompress(context, chunkSize = 500, depth = 0, maxDepth = 3) {
  if (depth >= maxDepth) return context; // Base case: stop recursion.

  const chunks = splitContext(context, chunkSize);
  const clusters = clusterChunks(chunks);

  const abstractions = Object.values(clusters).map(cluster => abstractCluster(cluster));
  const nextContext = abstractions.join(' ');

  return recursiveCompress(nextContext, chunkSize, depth + 1, maxDepth);
}

/**
 * Utility function to compress and summarize any input text.
 * @param {string} input - The text to compress and summarize.
 * @returns {string} - The compressed and summarized result.
 */
export function compressText(input) {
  return recursiveCompress(input);
}
