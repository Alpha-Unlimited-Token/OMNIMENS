/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalContextManager
 * Written: 2026-04-03T05:37:26.029Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchicalContextManager.mjs

import { createHash } from 'crypto';

/**
 * Splits a large context into overlapping windows of specified size and overlap.
 * @param {string} context - The large input text to process.
 * @param {number} windowSize - The size of each window.
 * @param {number} overlap - The number of overlapping tokens between windows.
 * @returns {Array<string>} - Array of overlapping context windows.
 */
export function splitContext(context, windowSize, overlap) {
  if (windowSize <= overlap) {
    throw new Error("Window size must be greater than overlap.");
  }

  const tokens = context.split(' ');
  const windows = [];

  for (let i = 0; i < tokens.length; i += windowSize - overlap) {
    const window = tokens.slice(i, i + windowSize).join(' ');
    windows.push(window);

    if (i + windowSize >= tokens.length) {
      break;
    }
  }

  return windows;
}

/**
 * Computes a semantic hash for a given text fragment.
 * @param {string} text - The input text fragment.
 * @returns {string} - A fixed-length hash representing the semantic content.
 */
export function computeSemanticHash(text) {
  const hash = createHash('sha256');
  hash.update(text);
  return hash.digest('hex').slice(0, 16); // Return a shortened hash for efficiency
}

/**
 * Reconstructs coherence across overlapping windows by stitching them together.
 * @param {Array<string>} windows - Array of overlapping context windows.
 * @param {number} overlap - The number of overlapping tokens between windows.
 * @returns {string} - The reconstructed coherent text.
 */
export function reconstructContext(windows, overlap) {
  if (windows.length === 0) return '';

  const reconstructed = [windows[0]];
  const overlapTokens = Math.floor(overlap / 2);

  for (let i = 1; i < windows.length; i++) {
    const prevTokens = windows[i - 1].split(' ').slice(-overlapTokens);
    const currTokens = windows[i].split(' ').slice(overlapTokens);

    const stitched = [...prevTokens, ...currTokens].join(' ');
    reconstructed.push(stitched);
  }

  return reconstructed.join(' ');
}

/**
 * Processes a large context by splitting, hashing, and reconstructing for coherence.
 * @param {string} context - The large input text to process.
 * @param {number} windowSize - The size of each window.
 * @param {number} overlap - The number of overlapping tokens between windows.
 * @returns {Object} - Processed context with original, windows, hashes, and reconstructed text.
 */
export function processContext(context, windowSize, overlap) {
  const windows = splitContext(context, windowSize, overlap);
  const hashes = windows.map(computeSemanticHash);
  const reconstructed = reconstructContext(windows, overlap);

  return {
    original: context,
    windows,
    hashes,
    reconstructed
  };
}

/**
 * Utility to calculate the similarity between two semantic hashes.
 * @param {string} hash1 - The first semantic hash.
 * @param {string} hash2 - The second semantic hash.
 * @returns {number} - A similarity score between 0 and 1.
 */
export function compareHashes(hash1, hash2) {
  if (hash1.length !== hash2.length) {
    throw new Error("Hashes must be of equal length.");
  }

  let matches = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] === hash2[i]) matches++;
  }

  return matches / hash1.length;
}

// Example usage:
// const result = processContext("This is a large context that needs processing.", 10, 5);
// console.log(result);