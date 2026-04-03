/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-03T00:29:04.879Z
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

import crypto from 'crypto';

/**
 * Generates a unique identifier for memory chunks.
 * @returns {string} A unique identifier.
 */
export function generateMemoryId() {
  return crypto.randomUUID();
}

/**
 * Summarizes a given text by chunking it and reducing each chunk to its key points.
 * @param {string} text - The text to summarize.
 * @param {number} chunkSize - The size of each chunk in characters.
 * @returns {Array<{id, summary}>} Array of summarized chunks with unique IDs.
 */
export function summarizeText(text, chunkSize = 500) {
  if (typeof text !== 'string' || text.length === 0) {
    throw new Error('Text must be a non-empty string.');
  }
  if (chunkSize <= 0) {
    throw new Error('Chunk size must be a positive integer.');
  }

  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize);
    const summary = chunk.split('. ').slice(0, 2).join('. ') + (chunk.length > chunkSize ? '...' : '');
    chunks.push({ id: generateMemoryId(), summary });
  }
  return chunks;
}

/**
 * Retrieves the most relevant memory chunk based on a query using simple keyword matching.
 * @param {Array<{id, summary}>} memoryChunks - Array of memory chunks.
 * @param {string} query - The search query.
 * @returns {{id, summary} | null} The most relevant memory chunk or null if none found.
 */
export function retrieveMemory(memoryChunks, query) {
  if (!Array.isArray(memoryChunks) || memoryChunks.length === 0) {
    throw new Error('Memory chunks must be a non-empty array.');
  }
  if (typeof query !== 'string' || query.length === 0) {
    throw new Error('Query must be a non-empty string.');
  }

  const queryWords = query.toLowerCase().split(' ');
  let bestMatch = null;
  let highestScore = 0;

  for (const chunk of memoryChunks) {
    const chunkWords = chunk.summary.toLowerCase().split(' ');
    const score = queryWords.reduce((acc, word) => acc + (chunkWords.includes(word) ? 1 : 0), 0);

    if (score > highestScore) {
      highestScore = score;
      bestMatch = chunk;
    }
  }

  return bestMatch;
}

/**
 * Replays a sequence of memory chunks in order.
 * @param {Array<{id, summary}>} memoryChunks - Array of memory chunks.
 * @returns {string} Concatenated summaries of all memory chunks.
 */
export function replayMemory(memoryChunks) {
  if (!Array.isArray(memoryChunks)) {
    throw new Error('Memory chunks must be an array.');
  }

  return memoryChunks.map(chunk => chunk.summary).join(' ');
}

/**
 * Combines multiple summaries into a higher-level summary.
 * @param {Array<{id, summary}>} memoryChunks - Array of memory chunks.
 * @returns {string} A single higher-level summary.
 */
export function summarizeMemory(memoryChunks) {
  if (!Array.isArray(memoryChunks) || memoryChunks.length === 0) {
    throw new Error('Memory chunks must be a non-empty array.');
  }

  const combinedText = memoryChunks.map(chunk => chunk.summary).join(' ');
  return combinedText.split('. ').slice(0, 5).join('. ') + '...';
}

/**
 * Updates a specific memory chunk by its ID.
 * @param {Array<{id, summary}>} memoryChunks - Array of memory chunks.
 * @param {string} id - The ID of the memory chunk to update.
 * @param {string} newSummary - The new summary to replace the old one.
 * @returns {Array<{id, summary}>} Updated array of memory chunks.
 */
export function updateMemoryChunk(memoryChunks, id, newSummary) {
  if (!Array.isArray(memoryChunks)) {
    throw new Error('Memory chunks must be an array.');
  }
  if (typeof id !== 'string' || id.length === 0) {
    throw new Error('ID must be a non-empty string.');
  }
  if (typeof newSummary !== 'string' || newSummary.length === 0) {
    throw new Error('New summary must be a non-empty string.');
  }

  return memoryChunks.map(chunk => (chunk.id === id ? { ...chunk, summary: newSummary } : chunk));
}
