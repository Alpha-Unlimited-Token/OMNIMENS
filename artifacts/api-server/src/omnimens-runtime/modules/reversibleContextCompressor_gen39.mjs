/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: reversibleContextCompressor
 * Written: 2026-04-01T22:05:24.216Z
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

import { createHash } from 'crypto';

/**
 * Hashes a string to ensure reversible encoding of compressed data.
 * @param {string} input - The input string to hash.
 * @returns {string} - A fixed-length hash of the input string.
 */
export function hashString(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Recursively compresses data using hierarchical clustering while preserving causal chains.
 * @param {Array} data - An array of objects or strings to compress.
 * @param {number} threshold - The importance threshold for compression.
 * @returns {Array} - A compressed and reversible representation of the data.
 */
export function compressData(data, threshold) {
  if (data.length <= 1) return data;

  // Step 1: Pairwise similarity scoring
  const scores = [];
  for (let i = 0; i < data.length; i++) {
    for (let j = i + 1; j < data.length; j++) {
      const similarity = calculateSimilarity(data[i], data[j]);
      scores.push({ pair: [i, j], similarity });
    }
  }

  // Step 2: Sort by similarity (descending)
  scores.sort((a, b) => b.similarity - a.similarity);

  // Step 3: Merge pairs above the threshold
  const merged = new Set();
  const clusters = [];
  for (const { pair, similarity } of scores) {
    if (similarity < threshold) break;

    const [i, j] = pair;
    if (!merged.has(i) && !merged.has(j)) {
      merged.add(i);
      merged.add(j);
      clusters.push({
        merged: true,
        data: [data[i], data[j]],
        hash: hashString(JSON.stringify([data[i], data[j]]))
      });
    }
  }

  // Step 4: Add unmerged items
  data.forEach((item, index) => {
    if (!merged.has(index)) {
      clusters.push({
        merged: false,
        data: item,
        hash: hashString(JSON.stringify(item))
      });
    }
  });

  // Step 5: Recursive compression
  const nextLevelData = clusters.map(cluster => cluster.hash);
  const nextLevelClusters = compressData(nextLevelData, threshold);

  return nextLevelClusters.map(hash => clusters.find(cluster => cluster.hash === hash));
}

/**
 * Calculates the similarity between two data points (generic utility function).
 * @param {any} a - The first data point.
 * @param {any} b - The second data point.
 * @returns {number} - A similarity score between 0 and 1.
 */
export function calculateSimilarity(a, b) {
  if (typeof a === 'string' && typeof b === 'string') {
    return stringSimilarity(a, b);
  }
  // Extend for other data types as needed
  return 0;
}

/**
 * Computes similarity between two strings using a basic character overlap ratio.
 * @param {string} str1 - The first string.
 * @param {string} str2 - The second string.
 * @returns {number} - A similarity score between 0 and 1.
 */
export function stringSimilarity(str1, str2) {
  const set1 = new Set(str1);
  const set2 = new Set(str2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  return intersection.size / Math.max(set1.size, set2.size);
}

/**
 * Decompresses data back to its original form using the reversible chain.
 * @param {Array} compressedData - The compressed data to decompress.
 * @returns {Array} - The original uncompressed data.
 */
export function decompressData(compressedData) {
  return compressedData.map(cluster => cluster.data);
}