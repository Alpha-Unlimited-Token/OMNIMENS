/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: episodicMemoryReplay
 * Written: 2026-04-02T15:17:17.637Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// episodicMemoryReplay.mjs

import { createHash } from 'crypto';

/**
 * Hashes a given input to generate a unique identifier for memory fragments.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash identifier.
 */
export function generateMemoryHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Summarizes a given text by extracting key sentences based on length and importance.
 * @param {string} text - The input text to summarize.
 * @param {number} maxSentences - Maximum number of sentences to include in the summary.
 * @returns {string[]} - Array of key sentences.
 */
export function summarizeText(text, maxSentences = 3) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const sortedSentences = sentences.sort((a, b) => b.length - a.length);
  return sortedSentences.slice(0, maxSentences);
}

/**
 * Replays episodic memory fragments by injecting them into the active context.
 * @param {Array<{ id, content}>} memoryFragments - Array of memory fragments.
 * @param {string} activeContext - The current active context.
 * @param {number} maxFragments - Maximum number of fragments to replay.
 * @returns {string} - The updated context with injected memory fragments.
 */
export function replayEpisodicMemory(memoryFragments, activeContext, maxFragments = 2) {
  const selectedFragments = memoryFragments
    .slice(0, maxFragments)
    .map(fragment => fragment.content)
    .join(' ');

  return `${selectedFragments} ${activeContext}`;
}

/**
 * Stores episodic memory fragments with unique identifiers.
 * @param {Array<{ id, content}>} memoryStore - The memory store to update.
 * @param {string} content - The content to store as a memory fragment.
 * @returns {Array<{ id, content}>} - Updated memory store.
 */
export function storeMemoryFragment(memoryStore, content) {
  const id = generateMemoryHash(content);
  const fragment = { id, content };
  return [...memoryStore, fragment];
}

/**
 * Searches memory fragments for those most similar to a given query.
 * @param {Array<{ id, content}>} memoryFragments - Array of memory fragments.
 * @param {string} query - The query to search for.
 * @returns {Array<{ id, content}>} - Sorted memory fragments by relevance.
 */
export function searchMemoryFragments(memoryFragments, query) {
  return memoryFragments
    .map(fragment => {
      const similarity = calculateStringSimilarity(fragment.content, query);
      return { ...fragment, similarity };
    })
    .sort((a, b) => b.similarity - a.similarity);
}

/**
 * Calculates a basic similarity score between two strings based on common word overlap.
 * @param {string} str1 - The first string.
 * @param {string} str2 - The second string.
 * @returns {number} - A similarity score between 0 and 1.
 */
export function calculateStringSimilarity(str1, str2) {
  const words1 = new Set(str1.toLowerCase().split(/\W+/));
  const words2 = new Set(str2.toLowerCase().split(/\W+/));
  const intersection = [...words1].filter(word => words2.has(word));
  return intersection.length / Math.max(words1.size, words2.size);
}

/**
 * Updates the active context by replaying relevant memory fragments and summarizing the result.
 * @param {Array<{ id, content}>} memoryFragments - Array of memory fragments.
 * @param {string} activeContext - The current active context.
 * @param {string} query - The query to determine relevant fragments.
 * @param {number} maxFragments - Maximum number of fragments to replay.
 * @param {number} maxSummarySentences - Maximum number of sentences in the final summary.
 * @returns {string} - The updated and summarized active context.
 */
export function updateContextWithMemory(memoryFragments, activeContext, query, maxFragments = 2, maxSummarySentences = 3) {
  const relevantFragments = searchMemoryFragments(memoryFragments, query).slice(0, maxFragments);
  const replayedContext = replayEpisodicMemory(relevantFragments, activeContext, maxFragments);
  const summarizedContext = summarizeText(replayedContext, maxSummarySentences).join(' ');
  return summarizedContext;
}

// Example usage:
// const memoryStore = [];
// const updatedStore = storeMemoryFragment(memoryStore, "This is a memory fragment.");
// const updatedContext = updateContextWithMemory(updatedStore, "Current task context.", "memory", 2, 3);