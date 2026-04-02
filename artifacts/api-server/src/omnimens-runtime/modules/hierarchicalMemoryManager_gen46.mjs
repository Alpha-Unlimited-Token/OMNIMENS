/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-02T14:26:36.724Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchicalMemoryManager.mjs
import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given input string.
 * Useful for identifying and indexing compressed memory sections.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash identifier.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Calculates an importance score for a memory fragment based on its metadata.
 * @param {Object} metadata - Metadata containing attributes like frequency, recency, and relevance.
 * @param {number} metadata.frequency - How often the memory is accessed.
 * @param {number} metadata.recency - How recently the memory was accessed (timestamp).
 * @param {number} metadata.relevance - The relevance score of the memory (0-1).
 * @returns {number} - A computed importance score (0-1).
 */
export function calculateImportanceScore({ frequency, recency, relevance }) {
  const now = Date.now();
  const timeDecay = Math.exp(-(now - recency) / (1000 * 60 * 60 * 24)); // Decay over days
  return Math.min(1, relevance * 0.5 + frequency * 0.3 + timeDecay * 0.2);
}

/**
 * Compresses a memory fragment into a summarized form.
 * @param {string} content - The original memory content.
 * @returns {Object} - An object containing the compressed content and its hash.
 */
export function compressMemory(content) {
  const summary = content.length > 100 ? content.slice(0, 100) + '...' : content;
  const hash = generateHash(content);
  return { hash, summary };
}

/**
 * Expands a compressed memory fragment back into its full form.
 * @param {Object} compressed - The compressed memory object.
 * @param {string} compressed.hash - The hash of the original content.
 * @param {string} compressed.summary - The summarized content.
 * @param {Map<string, string>} memoryStore - A map storing original content by hash.
 * @returns {string|null} - The full memory content or null if not found.
 */
export function expandMemory(compressed, memoryStore) {
  return memoryStore.get(compressed.hash) || null;
}

/**
 * Manages hierarchical memory by storing, compressing, and expanding memory fragments.
 * @param {string} content - The memory content to store.
 * @param {Map<string, string>} memoryStore - A map storing original content by hash.
 * @returns {Object} - The compressed memory object.
 */
export function manageMemory(content, memoryStore) {
  const compressed = compressMemory(content);
  memoryStore.set(compressed.hash, content);
  return compressed;
}

/**
 * Retrieves relevant memory fragments based on a query and importance scoring.
 * @param {string} query - The search query.
 * @param {Map<string, { content, metadata}>} memoryStore - A map of memory fragments.
 * @param {number} threshold - The minimum importance score for relevance.
 * @returns {Array<Object>} - A list of relevant memory fragments.
 */
export function retrieveRelevantMemories(query, memoryStore, threshold = 0.5) {
  const results = [];
  for (const [hash, { content, metadata }] of memoryStore.entries()) {
    const importance = calculateImportanceScore(metadata);
    if (importance >= threshold && content.includes(query)) {
      results.push({ hash, content, importance });
    }
  }
  return results.sort((a, b) => b.importance - a.importance);
}

/**
 * Dynamically expands compressed memory fragments based on relevance queries.
 * @param {string} query - The search query.
 * @param {Map<string, string>} memoryStore - A map storing original content by hash.
 * @param {Array<Object>} compressedMemories - A list of compressed memory objects.
 * @returns {Array<string>} - A list of expanded memory contents.
 */
export function dynamicContextExpansion(query, memoryStore, compressedMemories) {
  const expanded = [];
  for (const compressed of compressedMemories) {
    if (compressed.summary.includes(query)) {
      const fullContent = expandMemory(compressed, memoryStore);
      if (fullContent) expanded.push(fullContent);
    }
  }
  return expanded;
}

/**
 * Initializes a hierarchical memory manager with a memory store.
 * @returns {Map<string, { content, metadata}>} - A new memory store.
 */
export function initializeMemoryStore() {
  return new Map();
}