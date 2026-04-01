/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-01T22:21:31.973Z
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
 * Generate a fixed-size embedding for a given text using a simple hashing mechanism.
 * @param {string} text - The input text to embed.
 * @param {number} size - The desired size of the embedding.
 * @returns {Uint8Array} - The fixed-size embedding as a Uint8Array.
 */
export function generateEmbedding(text, size) {
  const hash = crypto.createHash('sha256').update(text, 'utf8').digest();
  const embedding = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    embedding[i] = hash[i % hash.length];
  }
  return embedding;
}

/**
 * Summarize an array of texts into a single compact representation.
 * @param {string[]} texts - An array of texts to summarize.
 * @param {number} embeddingSize - The size of the resulting summary embedding.
 * @returns {Uint8Array} - The summarized embedding.
 */
export function summarizeTexts(texts, embeddingSize) {
  const combinedText = texts.join(' ');
  return generateEmbedding(combinedText, embeddingSize);
}

/**
 * Manage hierarchical memory by periodically condensing older context into compact embeddings.
 * @param {Array<{timestamp, text}>} memory - Array of memory objects with timestamps and text.
 * @param {number} maxMemorySize - Maximum number of raw memory entries to retain.
 * @param {number} embeddingSize - Size of the compact embeddings.
 * @returns {Array<{timestamp, embedding}>} - Condensed memory hierarchy.
 */
export function manageMemoryHierarchy(memory, maxMemorySize, embeddingSize) {
  if (!Array.isArray(memory) || memory.length === 0) return [];

  // Sort memory by timestamp (oldest to newest)
  memory.sort((a, b) => a.timestamp - b.timestamp);

  // Retain the most recent entries up to maxMemorySize
  const recentMemory = memory.slice(-maxMemorySize);

  // Condense older entries into a single summary embedding
  const olderMemory = memory.slice(0, -maxMemorySize);
  let condensedMemory = [];
  if (olderMemory.length > 0) {
    const olderTexts = olderMemory.map(entry => entry.text);
    const summaryEmbedding = summarizeTexts(olderTexts, embeddingSize);
    condensedMemory.push({
      timestamp: olderMemory[0].timestamp, // Use the oldest timestamp for the summary
      embedding: summaryEmbedding
    });
  }

  // Convert recent memory to embeddings
  const recentEmbeddings = recentMemory.map(entry => ({
    timestamp: entry.timestamp,
    embedding: generateEmbedding(entry.text, embeddingSize)
  }));

  // Combine condensed and recent memory
  return [...condensedMemory, ...recentEmbeddings];
}

/**
 * Utility function to format a timestamp for debugging or display purposes.
 * @param {number} timestamp - The timestamp to format.
 * @returns {string} - A human-readable date string.
 */
export function formatTimestamp(timestamp) {
  return new Date(timestamp).toISOString();
}

/**
 * Utility function to compare two embeddings for similarity (cosine similarity approximation).
 * @param {Uint8Array} embeddingA - The first embedding.
 * @param {Uint8Array} embeddingB - The second embedding.
 * @returns {number} - A similarity score between 0 and 1.
 */
export function compareEmbeddings(embeddingA, embeddingB) {
  if (embeddingA.length !== embeddingB.length) throw new Error('Embeddings must be of the same size.');

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < embeddingA.length; i++) {
    dotProduct += embeddingA[i] * embeddingB[i];
    magnitudeA += embeddingA[i] ** 2;
    magnitudeB += embeddingB[i] ** 2;
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}
