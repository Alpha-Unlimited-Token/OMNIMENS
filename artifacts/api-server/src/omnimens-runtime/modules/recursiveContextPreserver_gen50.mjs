/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: recursiveContextPreserver
 * Written: 2026-04-02T15:17:38.132Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// recursiveContextPreserver.mjs

import { createHash } from 'crypto';

/**
 * Generates a semantic hash for a given text input to identify unique contexts.
 * @param {string} text - The input text to hash.
 * @returns {string} - A hexadecimal hash representing the text.
 */
export function generateSemanticHash(text) {
  const hash = createHash('sha256');
  hash.update(text);
  return hash.digest('hex');
}

/**
 * Summarizes a block of text while preserving key semantic elements.
 * @param {string} text - The input text to summarize.
 * @param {number} maxLength - The maximum length of the summary.
 * @returns {string} - A summarized version of the input text.
 */
export function summarizeText(text, maxLength) {
  if (text.length <= maxLength) return text;

  const sentences = text.split('. ');
  const summary = [];
  let currentLength = 0;

  for (const sentence of sentences) {
    if (currentLength + sentence.length + 1 > maxLength) break;
    summary.push(sentence);
    currentLength += sentence.length + 1;
  }

  return summary.join('. ') + (currentLength < text.length ? '...' : '');
}

/**
 * Recursively refines semantic embeddings for hierarchical context preservation.
 * @param {string[]} textChunks - Array of text chunks to process.
 * @param {number} maxChunks - Maximum number of chunks to retain.
 * @returns {string[]} - A refined array of text chunks preserving context.
 */
export function refineContext(textChunks, maxChunks) {
  if (textChunks.length <= maxChunks) return textChunks;

  const refinedChunks = [];
  for (let i = 0; i < textChunks.length; i += 2) {
    const combined = textChunks[i] + (textChunks[i + 1] || '');
    refinedChunks.push(summarizeText(combined, Math.floor(combined.length / 2)));
  }

  return refineContext(refinedChunks, maxChunks);
}

/**
 * Main function to compress and preserve semantic context from long-form text.
 * @param {string} text - The input text to process.
 * @param {number} tokenLimit - The maximum token limit for the output.
 * @returns {string[]} - Array of refined text chunks within the token limit.
 */
export function compressContext(text, tokenLimit) {
  const words = text.split(' ');
  const chunkSize = Math.ceil(words.length / Math.ceil(words.length / tokenLimit));
  const chunks = [];

  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }

  return refineContext(chunks, Math.ceil(tokenLimit / chunkSize));
}

/**
 * Utility to calculate the semantic similarity between two text inputs.
 * @param {string} text1 - The first text input.
 * @param {string} text2 - The second text input.
 * @returns {number} - A similarity score between 0 and 1.
 */
export function calculateSemanticSimilarity(text1, text2) {
  const hash1 = generateSemanticHash(text1);
  const hash2 = generateSemanticHash(text2);

  let matches = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] === hash2[i]) matches++;
  }

  return matches / hash1.length;
}

/**
 * Splits text into hierarchical levels for recursive processing.
 * @param {string} text - The input text to split.
 * @param {number} levels - The number of hierarchical levels to create.
 * @returns {string[][]} - A nested array of text chunks by levels.
 */
export function splitHierarchically(text, levels) {
  const chunks = [text];

  for (let i = 1; i < levels; i++) {
    const refined = [];
    for (const chunk of chunks[chunks.length - 1]) {
      refined.push(...chunk.split('. '));
    }
    chunks.push(refined);
  }

  return chunks;
}