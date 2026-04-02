/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hybridMemorySystem
 * Written: 2026-04-02T14:23:29.904Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hybridMemorySystem.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given input string (used for chunk IDs in the vector store).
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Computes cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The cosine similarity between the two vectors.
 */
export function cosineSimilarity(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Hierarchically summarizes a large text into smaller chunks.
 * @param {string} text - The input text to summarize.
 * @param {number} chunkSize - Maximum size of each chunk.
 * @returns {string[]} - An array of summarized chunks.
 */
export function hierarchicalSummarization(text, chunkSize) {
  const sentences = text.split('.');
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= chunkSize) {
      currentChunk += sentence + '.';
    } else {
      chunks.push(currentChunk.trim());
      currentChunk = sentence + '.';
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());

  return chunks;
}

/**
 * Stores vectorized chunks in a simple in-memory vector store.
 * @param {Object} vectorStore - The vector store object.
 * @param {string} id - A unique identifier for the chunk.
 * @param {number[]} vector - The vector representation of the chunk.
 */
export function storeVector(vectorStore, id, vector) {
  vectorStore[id] = vector;
}

/**
 * Retrieves the most relevant chunks from the vector store based on cosine similarity.
 * @param {Object} vectorStore - The vector store object.
 * @param {number[]} queryVector - The vector representation of the query.
 * @param {number} topK - The number of top results to retrieve.
 * @returns {string[]} - An array of IDs of the most relevant chunks.
 */
export function retrieveRelevantChunks(vectorStore, queryVector, topK) {
  const similarities = Object.entries(vectorStore).map(([id, vector]) => ({
    id,
    similarity: cosineSimilarity(queryVector, vector)
  }));

  similarities.sort((a, b) => b.similarity - a.similarity);
  return similarities.slice(0, topK).map(entry => entry.id);
}

/**
 * Combines retrieved chunks into a single context string.
 * @param {string[]} chunks - The array of text chunks.
 * @returns {string} - The combined context string.
 */
export function combineChunks(chunks) {
  return chunks.join(' ');
}

/**
 * Main function to process text, store vectors, and retrieve relevant context.
 * @param {string} text - The input text to process.
 * @param {Function} vectorizeFunction - A function to vectorize text chunks.
 * @param {number[]} queryVector - The vector representation of the query.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @param {number} topK - The number of top results to retrieve.
 * @returns {string} - The combined relevant context.
 */
export function hybridMemorySystem(text, vectorizeFunction, queryVector, chunkSize, topK) {
  const vectorStore = {};
  const chunks = hierarchicalSummarization(text, chunkSize);

  chunks.forEach(chunk => {
    const vector = vectorizeFunction(chunk);
    const id = generateHash(chunk);
    storeVector(vectorStore, id, vector);
  });

  const relevantChunkIds = retrieveRelevantChunks(vectorStore, queryVector, topK);
  const relevantChunks = relevantChunkIds.map(id => Object.keys(vectorStore).find(key => key === id));

  return combineChunks(relevantChunks);
}
