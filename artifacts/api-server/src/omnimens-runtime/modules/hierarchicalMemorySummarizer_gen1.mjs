/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemorySummarizer
 * Written: 2026-04-01T22:02:27.206Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchicalMemorySummarizer.mjs

import crypto from 'crypto';

/**
 * Generates a hash for a given input string. Useful for chunk deduplication.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash of the input.
 */
export function generateHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Summarizes a chunk of text using a simple heuristic: extract key sentences.
 * @param {string} text - The input text to summarize.
 * @param {number} maxSentences - Maximum number of sentences to include in the summary.
 * @returns {string} - The summarized text.
 */
export function summarizeText(text, maxSentences = 3) {
  const sentences = text.match(/[^.!?]+[.!?]/g) || [];
  return sentences.slice(0, maxSentences).join(' ').trim();
}

/**
 * Hierarchically summarizes a large body of text by chunking and recursively summarizing.
 * @param {string} text - The input text to process.
 * @param {number} chunkSize - Number of sentences per chunk.
 * @param {number} maxDepth - Maximum depth for recursive summarization.
 * @returns {string} - The final hierarchical summary.
 */
export function hierarchicalSummarize(text, chunkSize = 5, maxDepth = 3) {
  if (maxDepth <= 0 || !text.trim()) return text.trim();

  const sentences = text.match(/[^.!?]+[.!?]/g) || [];
  if (sentences.length <= chunkSize) return summarizeText(text);

  const chunks = [];
  for (let i = 0; i < sentences.length; i += chunkSize) {
    chunks.push(sentences.slice(i, i + chunkSize).join(' ').trim());
  }

  const summarizedChunks = chunks.map(chunk => summarizeText(chunk));
  return hierarchicalSummarize(summarizedChunks.join(' '), chunkSize, maxDepth - 1);
}

/**
 * Retrieves relevant chunks from a memory store using a simple keyword match.
 * @param {Array<{hash, content}>} memoryStore - The memory store containing chunks.
 * @param {string} query - The search query.
 * @returns {Array<string>} - Relevant chunks matching the query.
 */
export function retrieveRelevantChunks(memoryStore, query) {
  const lowerQuery = query.toLowerCase();
  return memoryStore
    .filter(({ content }) => content.toLowerCase().includes(lowerQuery))
    .map(({ content }) => content);
}

/**
 * Adds a new chunk to the memory store if it's not already present.
 * @param {Array<{hash, content}>} memoryStore - The memory store to update.
 * @param {string} chunk - The chunk to add.
 * @returns {void}
 */
export function addChunkToMemory(memoryStore, chunk) {
  const hash = generateHash(chunk);
  if (!memoryStore.some(entry => entry.hash === hash)) {
    memoryStore.push({ hash, content: chunk });
  }
}

/**
 * Reconstructs context from memory by retrieving and summarizing relevant chunks.
 * @param {Array<{hash, content}>} memoryStore - The memory store containing chunks.
 * @param {string} query - The search query.
 * @param {number} maxChunks - Maximum number of chunks to retrieve.
 * @returns {string} - The reconstructed context.
 */
export function reconstructContext(memoryStore, query, maxChunks = 3) {
  const relevantChunks = retrieveRelevantChunks(memoryStore, query).slice(0, maxChunks);
  return hierarchicalSummarize(relevantChunks.join(' '));
}

// Example memory store structure
const memoryStore = [];

// Example usage
const text = "Artificial intelligence is a branch of computer science. It focuses on creating systems capable of performing tasks that typically require human intelligence. Examples include visual perception, speech recognition, decision-making, and language translation.";
addChunkToMemory(memoryStore, text);
const query = "human intelligence";
const context = reconstructContext(memoryStore, query);
console.log(context);