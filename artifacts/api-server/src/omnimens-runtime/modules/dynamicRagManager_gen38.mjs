/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: dynamicRagManager
 * Written: 2026-04-02T15:16:20.694Z
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
 * Hashes input data to create unique identifiers for context segments.
 * @param {string} data - The input data to hash.
 * @returns {string} - A unique hash of the input data.
 */
export function generateHash(data) {
  const hash = createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
}

/**
 * Summarizes a given text hierarchically to compress its content.
 * @param {string} text - The input text to summarize.
 * @param {number} levels - The number of summarization levels to apply.
 * @returns {string[]} - Array of summaries from most detailed to most abstract.
 */
export function hierarchicalSummarize(text, levels = 3) {
  if (typeof text !== 'string' || levels < 1) {
    throw new Error('Invalid input: text must be a string and levels must be a positive integer.');
  }

  const summaries = [text];
  for (let i = 1; i < levels; i++) {
    const lastSummary = summaries[summaries.length - 1];
    const sentences = lastSummary.split('. ').filter(Boolean);
    const compressed = sentences
      .filter((_, index) => index % 2 === 0)
      .join('. ');
    summaries.push(compressed);
  }

  return summaries;
}

/**
 * Retrieves the most relevant context segments based on a query.
 * @param {string} query - The search query.
 * @param {Array<{id, content}>} contextSegments - Array of context segments.
 * @returns {Array<{id, content}>} - Sorted array of relevant segments.
 */
export function retrieveRelevantSegments(query, contextSegments) {
  if (typeof query !== 'string' || !Array.isArray(contextSegments)) {
    throw new Error('Invalid input: query must be a string and contextSegments must be an array.');
  }

  return contextSegments
    .map(segment => {
      const relevanceScore = calculateRelevance(query, segment.content);
      return { ...segment, relevanceScore };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Calculates the relevance of a context segment to a query using a simple keyword match.
 * @param {string} query - The search query.
 * @param {string} content - The context segment content.
 * @returns {number} - Relevance score (higher is more relevant).
 */
export function calculateRelevance(query, content) {
  const queryWords = query.toLowerCase().split(/\s+/);
  const contentWords = content.toLowerCase().split(/\s+/);
  const matchCount = queryWords.filter(word => contentWords.includes(word)).length;
  return matchCount / queryWords.length;
}

/**
 * Dynamically manages context by summarizing, storing, and retrieving compressed segments.
 * @param {string} query - The search query.
 * @param {string} fullContext - The full context to process.
 * @param {number} summarizationLevels - Levels of summarization to apply.
 * @returns {Array<{id, content}>} - Relevant compressed segments.
 */
export function dynamicContextManager(query, fullContext, summarizationLevels = 3) {
  const summaries = hierarchicalSummarize(fullContext, summarizationLevels);
  const contextSegments = summaries.map((summary, index) => ({
    id: generateHash(summary + index),
    content: summary
  }));

  return retrieveRelevantSegments(query, contextSegments);
}

/**
 * Utility to validate input data for the module's functions.
 * @param {any} input - The input data to validate.
 * @param {string} type - The expected type of the input.
 * @returns {boolean} - Whether the input is valid.
 */
export function validateInput(input, type) {
  return typeof input === type;
}
