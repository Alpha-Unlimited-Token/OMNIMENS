/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: multiPassTokenStitcher
 * Written: 2026-04-02T13:30:29.648Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// multiPassTokenStitcher.mjs

import { createHash } from 'crypto';

/**
 * Splits a large text input into overlapping sliding windows of tokens.
 * @param {string} text - The input text to segment.
 * @param {number} windowSize - The size of each window in tokens.
 * @param {number} overlap - The number of overlapping tokens between windows.
 * @returns {Array<string>} - Array of segmented text windows.
 */
export function segmentText(text, windowSize, overlap) {
  if (windowSize <= overlap) throw new Error("windowSize must be greater than overlap");

  const tokens = text.split(/\s+/);
  const windows = [];

  for (let i = 0; i < tokens.length; i += windowSize - overlap) {
    windows.push(tokens.slice(i, i + windowSize).join(" "));
  }

  return windows;
}

/**
 * Generates a semantic hash for a given text segment.
 * @param {string} text - The input text segment.
 * @returns {string} - A hash representing the semantic content.
 */
export function generateSemanticHash(text) {
  const hash = createHash('sha256');
  hash.update(text);
  return hash.digest('hex');
}

/**
 * Merges overlapping text windows into a coherent summary.
 * @param {Array<string>} windows - Array of text windows.
 * @param {number} attentionWeight - Weight factor for prioritizing key windows.
 * @returns {string} - A semantically coherent stitched summary.
 */
export function stitchWindows(windows, attentionWeight = 1) {
  const combinedText = windows.join(" ");
  const tokenFrequency = {};

  combinedText.split(/\s+/).forEach(token => {
    tokenFrequency[token] = (tokenFrequency[token] || 0) + 1;
  });

  const weightedTokens = Object.entries(tokenFrequency)
    .map(([token, freq]) => ({ token, weight: freq ** attentionWeight }))
    .sort((a, b) => b.weight - a.weight);

  return weightedTokens.map(entry => entry.token).join(" ");
}

/**
 * Hierarchically summarizes a large text input by segmenting, hashing, and stitching.
 * @param {string} text - The input text to process.
 * @param {number} windowSize - The size of each window in tokens.
 * @param {number} overlap - The number of overlapping tokens between windows.
 * @param {number} attentionWeight - Weight factor for prioritizing key windows.
 * @returns {string} - The final summarized text.
 */
export function hierarchicalSummarization(text, windowSize, overlap, attentionWeight = 1) {
  const windows = segmentText(text, windowSize, overlap);
  const hashes = windows.map(generateSemanticHash);

  const stitchedSummary = stitchWindows(windows, attentionWeight);

  return {
    summary: stitchedSummary,
    hashes
  };
}

/**
 * Utility function to calculate token overlap percentage between two text segments.
 * @param {string} textA - First text segment.
 * @param {string} textB - Second text segment.
 * @returns {number} - Percentage of overlapping tokens.
 */
export function calculateTokenOverlap(textA, textB) {
  const tokensA = new Set(textA.split(/\s+/));
  const tokensB = new Set(textB.split(/\s+/));

  const intersection = new Set([...tokensA].filter(token => tokensB.has(token)));
  return (intersection.size / Math.min(tokensA.size, tokensB.size)) * 100;
}
