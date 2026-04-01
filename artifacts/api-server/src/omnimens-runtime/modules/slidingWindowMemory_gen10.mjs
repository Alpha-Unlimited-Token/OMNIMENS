/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: slidingWindowMemory
 * Written: 2026-04-01T22:22:10.118Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * TRANSLATION STATUS:
 * Novel constructs: attention
 * All constructs have translation mappings
 * Compiled targets: javascript: OK (4 IR steps) | python: OK (4 IR steps) | c: OK (4 IR steps) | x86_64: OK (4 IR steps) | arm64: OK (4 IR steps) | avr: OK (4 IR steps)
 * Translation map version: 22
 */
// slidingWindowMemory.mjs

import { createHash } from 'crypto';

/**
 * Generate a hash for unique identification of context segments.
 * @param {string} input - The input string to hash.
 * @returns {string} - A compact hash of the input.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex').slice(0, 16);
}

/**
 * Summarizes a block of text into a compact representation.
 * @param {string} text - The text to summarize.
 * @param {number} maxLength - Maximum length of the summary.
 * @returns {string} - A summarized version of the text.
 */
export function summarizeText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  const words = text.split(' ');
  let summary = '';
  for (const word of words) {
    if ((summary + word).length > maxLength) break;
    summary += (summary ? ' ' : '') + word;
  }
  return summary + '...';
}

/**
 * Maintains hierarchical attention by storing and retrieving summarized context.
 */
export class SlidingWindowMemory {
  constructor(windowSize = 5) {
    this.windowSize = windowSize; // Number of summaries to retain in active memory.
    this.memory = new Map(); // Stores hashed keys and their summaries.
    this.activeKeys = []; // Tracks the order of active keys for retrieval.
  }

  /**
   * Adds a new context to memory, summarizing it if necessary.
   * @param {string} context - The full context to store.
   */
  addContext(context) {
    const hash = generateHash(context);
    if (!this.memory.has(hash)) {
      const summary = summarizeText(context);
      this.memory.set(hash, { context, summary });
      this.activeKeys.push(hash);

      // Enforce window size limit.
      if (this.activeKeys.length > this.windowSize) {
        const oldestKey = this.activeKeys.shift();
        this.memory.delete(oldestKey);
      }
    }
  }

  /**
   * Retrieves the most relevant summaries based on a query.
   * @param {string} query - The query to match against stored summaries.
   * @param {number} topN - Number of relevant summaries to retrieve.
   * @returns {Array<{summary, context}>} - Relevant summaries and their full contexts.
   */
  retrieveRelevantSummaries(query, topN = 3) {
    const scoredSummaries = Array.from(this.memory.values()).map(({ summary, context }) => {
      const relevance = calculateRelevance(query, summary);
      return { summary, context, relevance };
    });

    // Sort by relevance score in descending order and return top N results.
    return scoredSummaries
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, topN)
      .map(({ summary, context }) => ({ summary, context }));
  }
}

/**
 * Calculates relevance of a summary to a query using simple token overlap.
 * @param {string} query - The query string.
 * @param {string} summary - The summary string.
 * @returns {number} - Relevance score (higher is better).
 */
export function calculateRelevance(query, summary) {
  const queryTokens = new Set(query.toLowerCase().split(/\s+/));
  const summaryTokens = new Set(summary.toLowerCase().split(/\s+/));
  const commonTokens = [...queryTokens].filter(token => summaryTokens.has(token));
  return commonTokens.length / Math.sqrt(queryTokens.size * summaryTokens.size);
}

/**
 * Utility function to reset memory (useful for testing or reinitialization).
 * @param {SlidingWindowMemory} memoryInstance - The memory instance to reset.
 */
export function resetMemory(memoryInstance) {
  memoryInstance.memory.clear();
  memoryInstance.activeKeys = [];
}
