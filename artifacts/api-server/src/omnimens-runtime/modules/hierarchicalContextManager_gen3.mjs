/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalContextManager
 * Written: 2026-04-01T22:13:37.003Z
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

import crypto from 'crypto';

/**
 * Generates a unique hash for a given string input.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash string.
 */
export function generateHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Summarizes a given text by truncating it to a specified length.
 * @param {string} text - The text to summarize.
 * @param {number} maxLength - The maximum length of the summary.
 * @returns {string} - The summarized text.
 */
export function summarizeText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Calculates relevance scores for context entries based on a query.
 * @param {string} query - The query to compare against.
 * @param {Array<string>} contextEntries - The list of context entries.
 * @returns {Array<{entry, score}>} - Array of entries with their relevance scores.
 */
export function calculateRelevance(query, contextEntries) {
  const queryWords = new Set(query.toLowerCase().split(/\W+/));
  return contextEntries.map(entry => {
    const entryWords = new Set(entry.toLowerCase().split(/\W+/));
    const commonWords = [...queryWords].filter(word => entryWords.has(word));
    const score = commonWords.length / queryWords.size;
    return { entry, score };
  }).sort((a, b) => b.score - a.score);
}

/**
 * Maintains a sliding window of context with recursive summarization.
 * @param {Array<string>} context - The current context entries.
 * @param {number} maxEntries - The maximum number of entries to keep in the window.
 * @returns {Array<string>} - The updated context window.
 */
export function slidingWindow(context, maxEntries) {
  if (context.length <= maxEntries) return context;
  const summary = summarizeText(context.slice(0, maxEntries).join(' '), 200);
  return [summary, ...context.slice(maxEntries)];
}

/**
 * Rehydrates context by selecting the most relevant entries based on a query.
 * @param {string} query - The query to use for rehydration.
 * @param {Array<string>} context - The list of context entries.
 * @param {number} maxEntries - The maximum number of entries to rehydrate.
 * @returns {Array<string>} - The rehydrated context entries.
 */
export function rehydrateContext(query, context, maxEntries) {
  const relevanceScores = calculateRelevance(query, context);
  return relevanceScores.slice(0, maxEntries).map(item => item.entry);
}

/**
 * Orchestrates hierarchical context management by combining sliding window and rehydration.
 * @param {Array<string>} context - The current context entries.
 * @param {string} query - The query for relevance scoring.
 * @param {number} maxEntries - The maximum number of entries to maintain.
 * @returns {Array<string>} - The updated context.
 */
export function manageContext(context, query, maxEntries) {
  const windowedContext = slidingWindow(context, maxEntries);
  return rehydrateContext(query, windowedContext, maxEntries);
}

/**
 * Utility to merge multiple contexts into a single hierarchical structure.
 * @param {Array<Array<string>>} contexts - Array of context arrays to merge.
 * @returns {Array<string>} - The merged and deduplicated context.
 */
export function mergeContexts(contexts) {
  const merged = new Set();
  contexts.flat().forEach(entry => merged.add(entry));
  return Array.from(merged);
}
