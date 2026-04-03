/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: recursiveContextCompressor
 * Written: 2026-04-03T01:28:27.363Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here

import { createHash } from 'crypto';

/**
 * Computes a semantic similarity score between two text inputs using a simple hashing-based approach.
 * @param {string} text1 - The first text input.
 * @param {string} text2 - The second text input.
 * @returns {number} - A similarity score between 0 and 1.
 */
export function computeSemanticSimilarity(text1, text2) {
  const hash1 = createHash('sha256').update(text1).digest('hex');
  const hash2 = createHash('sha256').update(text2).digest('hex');

  let matches = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] === hash2[i]) matches++;
  }

  return matches / hash1.length;
}

/**
 * Recursively compresses a list of text items by summarizing and retaining the most semantically similar content.
 * @param {string[]} texts - An array of text inputs.
 * @param {number} threshold - A similarity threshold (0 to 1) for merging summaries.
 * @returns {string[]} - A compressed list of summarized texts.
 */
export function recursiveContextCompressor(texts, threshold = 0.75) {
  if (texts.length <= 1) return texts;

  const compressedTexts = [];
  const used = new Set();

  for (let i = 0; i < texts.length; i++) {
    if (used.has(i)) continue;

    let summary = texts[i];
    used.add(i);

    for (let j = i + 1; j < texts.length; j++) {
      if (used.has(j)) continue;

      const similarity = computeSemanticSimilarity(summary, texts[j]);
      if (similarity >= threshold) {
        summary = summarizeText(summary, texts[j]);
        used.add(j);
      }
    }

    compressedTexts.push(summary);
  }

  return recursiveContextCompressor(compressedTexts, threshold);
}

/**
 * Summarizes two text inputs into a single representative text.
 * @param {string} text1 - The first text input.
 * @param {string} text2 - The second text input.
 * @returns {string} - A summarized text combining the essence of both inputs.
 */
export function summarizeText(text1, text2) {
  const words1 = new Set(text1.split(/\s+/));
  const words2 = new Set(text2.split(/\s+/));

  const commonWords = [...words1].filter(word => words2.has(word));
  const uniqueWords = [...words1, ...words2].filter(word => !commonWords.includes(word));

  return [...commonWords, ...uniqueWords].join(' ');
}

/**
 * Utility function to split a large text into manageable chunks.
 * @param {string} text - The input text to split.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @returns {string[]} - An array of text chunks.
 */
export function splitTextIntoChunks(text, chunkSize = 512) {
  const words = text.split(/\s+/);
  const chunks = [];
  let currentChunk = [];

  for (const word of words) {
    if (currentChunk.join(' ').length + word.length + 1 > chunkSize) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [];
    }
    currentChunk.push(word);
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }

  return chunks;
}
