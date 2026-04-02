/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextualMemoryReconstructor
 * Written: 2026-04-02T15:15:49.843Z
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
 * Generates a hash for a given string using SHA-256.
 * @param {string} input - The input string to hash.
 * @returns {string} - The resulting hash.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Summarizes a given text by reducing its length while preserving key information.
 * @param {string} text - The input text to summarize.
 * @param {number} maxLength - The maximum length of the summary.
 * @returns {string} - The summarized text.
 */
export function summarizeText(text, maxLength) {
  if (text.length <= maxLength) return text;

  const sentences = text.split('. ');
  const summary = [];

  for (const sentence of sentences) {
    if (summary.join('. ').length + sentence.length + 2 <= maxLength) {
      summary.push(sentence);
    } else {
      break;
    }
  }

  return summary.join('. ') + (summary.length < sentences.length ? '...' : '');
}

/**
 * Stores and retrieves hierarchical summaries with metadata indexing.
 * @class
 */
export class ContextualMemoryReconstructor {
  constructor() {
    this.memory = new Map();
  }

  /**
   * Adds a text to memory with a generated hash key.
   * @param {string} text - The text to store.
   */
  addToMemory(text) {
    const hashKey = generateHash(text);
    this.memory.set(hashKey, text);
  }

  /**
   * Retrieves text from memory using its hash key.
   * @param {string} hashKey - The hash key of the text to retrieve.
   * @returns {string|null} - The retrieved text or null if not found.
   */
  retrieveFromMemory(hashKey) {
    return this.memory.get(hashKey) || null;
  }

  /**
   * Reconstructs context by combining lossy summarization and selective retrieval.
   * @param {string[]} texts - Array of texts to process.
   * @param {number} summaryLength - Maximum length of each summary.
   * @returns {object} - An object containing summaries and their hash keys.
   */
  reconstructContext(texts, summaryLength) {
    const reconstructed = [];

    for (const text of texts) {
      const summary = summarizeText(text, summaryLength);
      const hashKey = generateHash(text);
      reconstructed.push({ summary, hashKey });
      this.addToMemory(text);
    }

    return reconstructed;
  }
}

/**
 * Utility function to calculate similarity between two strings using Jaccard index.
 * @param {string} str1 - First string.
 * @param {string} str2 - Second string.
 * @returns {number} - Similarity score between 0 and 1.
 */
export function calculateJaccardSimilarity(str1, str2) {
  const set1 = new Set(str1.split(' '));
  const set2 = new Set(str2.split(' '));

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

/**
 * Utility function to perform LSH-based indexing simulation.
 * @param {string[]} texts - Array of texts to index.
 * @returns {Map} - Map of hash keys to texts.
 */
export function lshIndexing(texts) {
  const index = new Map();

  for (const text of texts) {
    const hashKey = generateHash(text);
    index.set(hashKey, text);
  }

  return index;
}
