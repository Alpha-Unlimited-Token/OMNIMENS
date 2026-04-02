/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: recursiveContextCompression
 * Written: 2026-04-02T14:55:00.487Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// recursiveContextCompression.mjs

import { createHash } from 'crypto';

/**
 * Generates a semantic hash for a given input string.
 * @param {string} input - The string to hash.
 * @returns {string} - A fixed-length semantic hash.
 */
export function generateSemanticHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex').slice(0, 16); // Return a 16-character hash
}

/**
 * Summarizes a block of text by extracting key sentences based on importance.
 * @param {string} text - The input text to summarize.
 * @param {number} sentenceLimit - The maximum number of sentences to retain.
 * @returns {string} - The summarized text.
 */
export function summarizeText(text, sentenceLimit = 3) {
  const sentences = text.match(/[^.!?]+[.!?]/g) || []; // Split into sentences
  if (sentences.length <= sentenceLimit) return text; // Return original if under limit

  // Rank sentences by length as a proxy for importance
  const rankedSentences = sentences
    .map((sentence, index) => ({ sentence, index, length: sentence.length }))
    .sort((a, b) => b.length - a.length);

  // Select top N sentences, sorted by their original order
  const selected = rankedSentences.slice(0, sentenceLimit).sort((a, b) => a.index - b.index);
  return selected.map(item => item.sentence).join(' ');
}

/**
 * Recursively compresses a large context into a smaller, semantically meaningful representation.
 * @param {string[]} contextBlocks - Array of text blocks representing the context.
 * @param {number} targetSize - The desired number of final blocks.
 * @returns {string[]} - The compressed context blocks.
 */
export function recursiveContextCompression(contextBlocks, targetSize = 5) {
  if (contextBlocks.length <= targetSize) return contextBlocks; // Base case

  // Pairwise merge and summarize adjacent blocks
  const mergedBlocks = [];
  for (let i = 0; i < contextBlocks.length; i += 2) {
    const blockA = contextBlocks[i];
    const blockB = contextBlocks[i + 1] || ''; // Handle odd number of blocks
    const combined = `${blockA} ${blockB}`;
    mergedBlocks.push(summarizeText(combined));
  }

  // Recurse until target size is reached
  return recursiveContextCompression(mergedBlocks, targetSize);
}

/**
 * Selects the most important blocks from a context based on semantic uniqueness.
 * @param {string[]} contextBlocks - Array of text blocks to evaluate.
 * @param {number} maxBlocks - The maximum number of blocks to retain.
 * @returns {string[]} - The most important and unique blocks.
 */
export function importanceWeightedSelection(contextBlocks, maxBlocks = 5) {
  const hashes = new Map();

  // Generate semantic hashes and track uniqueness
  contextBlocks.forEach(block => {
    const hash = generateSemanticHash(block);
    if (!hashes.has(hash)) {
      hashes.set(hash, block);
    }
  });

  // Select up to maxBlocks unique blocks
  return Array.from(hashes.values()).slice(0, maxBlocks);
}

/**
 * Main utility function to compress and optimize context for reasoning.
 * @param {string[]} contextBlocks - Array of text blocks representing the context.
 * @param {number} targetSize - Desired number of final context blocks.
 * @returns {string[]} - The optimized context blocks.
 */
export function compressContext(contextBlocks, targetSize = 5) {
  const compressed = recursiveContextCompression(contextBlocks, targetSize * 2); // Overcompress initially
  return importanceWeightedSelection(compressed, targetSize); // Refine selection
}

// Example usage (commented out for module-only use):
// const context = ["Block 1 text...", "Block 2 text...", "Block 3 text..."];
// console.log(compressContext(context, 2));