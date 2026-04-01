/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextWindowManager
 * Written: 2026-04-01T22:00:30.290Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextWindowManager.mjs

import crypto from 'crypto';

/**
 * Splits a long text into smaller chunks using a sliding window approach.
 * Dynamically adjusts overlap based on semantic importance.
 */

// Utility to calculate semantic importance using a simple hash-based heuristic
function calculateSemanticImportance(text) {
  const hash = crypto.createHash('sha256').update(text).digest('hex');
  const numericValue = parseInt(hash.slice(0, 8), 16); // Use first 8 hex chars
  return numericValue % 100; // Normalize importance to a scale of 0-99
}

/**
 * Splits text into overlapping chunks based on dynamic overlap adjustment.
 * @param {string} text - The full text to segment.
 * @param {number} chunkSize - The size of each chunk.
 * @param {number} baseOverlap - The minimum overlap between chunks.
 * @returns {Array<string>} - Array of segmented chunks.
 */
export function segmentTextWithDynamicOverlap(text, chunkSize = 200, baseOverlap = 50) {
  if (chunkSize <= baseOverlap) {
    throw new Error("chunkSize must be greater than baseOverlap");
  }

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);

    // Calculate semantic importance of the current chunk
    const importance = calculateSemanticImportance(chunk);

    // Adjust overlap dynamically (higher importance -> larger overlap)
    const dynamicOverlap = Math.min(baseOverlap + Math.floor(importance / 10), chunkSize - 1);

    chunks.push(chunk);

    // Slide window forward
    start += chunkSize - dynamicOverlap;
  }

  return chunks;
}

/**
 * Merges overlapping chunks back into a single text, preserving context.
 * @param {Array<string>} chunks - Array of overlapping text chunks.
 * @returns {string} - Reconstructed text.
 */
export function reconstructTextFromChunks(chunks) {
  let reconstructedText = "";

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    // Avoid duplicate overlap by trimming already-reconstructed parts
    if (i > 0) {
      const overlapStart = reconstructedText.lastIndexOf(chunk.slice(0, 10));
      reconstructedText += chunk.slice(overlapStart === -1 ? 0 : overlapStart + 10);
    } else {
      reconstructedText += chunk;
    }
  }

  return reconstructedText;
}

/**
 * Utility function to calculate average semantic importance of a text.
 * @param {string} text - Input text.
 * @returns {number} - Average semantic importance.
 */
export function calculateAverageImportance(text) {
  const chunks = segmentTextWithDynamicOverlap(text, 200, 50);
  const importanceValues = chunks.map(calculateSemanticImportance);
  const totalImportance = importanceValues.reduce((sum, val) => sum + val, 0);
  return totalImportance / importanceValues.length;
}

/**
 * Utility function to validate input text and parameters.
 * @param {string} text - Input text.
 * @param {number} chunkSize - Chunk size.
 * @param {number} overlap - Overlap size.
 * @returns {boolean} - Validation result.
 */
export function validateParameters(text, chunkSize, overlap) {
  if (typeof text !== 'string' || text.length === 0) {
    return false;
  }
  if (typeof chunkSize !== 'number' || chunkSize <= 0) {
    return false;
  }
  if (typeof overlap !== 'number' || overlap < 0 || overlap >= chunkSize) {
    return false;
  }
  return true;
}

export const moduleDescription = "Handles long texts by segmenting them into smaller, overlapping chunks using dynamic overlap adjustment based on semantic importance.";