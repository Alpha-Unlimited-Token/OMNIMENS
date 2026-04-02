/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: multiPassContextReconstructor
 * Written: 2026-04-02T14:52:16.918Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// multiPassContextReconstructor.mjs

import { createHash } from 'crypto';

/**
 * Computes cosine similarity between two vectors.
 * @param {number[]} vecA - First vector.
 * @param {number[]} vecB - Second vector.
 * @returns {number} - Cosine similarity score.
 */
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) throw new Error('Vectors must have the same length.');

  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));

  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Generates a stable hash for a given string.
 * @param {string} input - Input string to hash.
 * @returns {string} - Hexadecimal hash string.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Dynamically retrieves and integrates key details from persistence layers.
 * @param {string[]} compressedContexts - Array of compressed context strings.
 * @param {Object} persistenceLayer - Object mapping hashes to original contexts.
 * @param {number} recencyWeight - Weighting factor for recent contexts (0-1).
 * @returns {string} - Reconstructed context.
 */
export function reconstructContext(compressedContexts, persistenceLayer, recencyWeight = 0.5) {
  if (!Array.isArray(compressedContexts) || typeof persistenceLayer !== 'object') {
    throw new Error('Invalid Array.from(/* args */{}): compressedContexts must be an array and persistenceLayer must be an object.');
  }

  const reconstructed = compressedContexts.map((compressed, index) => {
    const hash = generateHash(compressed);
    const originalContext = persistenceLayer[hash];

    if (!originalContext) return ''; // Skip if no matching context found.

    const importanceScore = (1 - recencyWeight) + recencyWeight * (index / compressedContexts.length);
    return { context: originalContext, score: importanceScore };
  });

  // Sort by importance score in descending order and combine contexts.
  return reconstructed
    .sort((a, b) => b.score - a.score)
    .map(entry => entry.context)
    .join(' ');
}

/**
 * Summarizes a given text hierarchically by splitting into chunks and summarizing iteratively.
 * @param {string} text - Input text to summarize.
 * @param {number} chunkSize - Maximum size of each chunk.
 * @param {Function} summarizeFunction - Function to summarize a chunk of text.
 * @returns {string} - Hierarchical summary of the text.
 */
export function hierarchicalSummarization(text, chunkSize, summarizeFunction) {
  if (typeof text !== 'string' || typeof chunkSize !== 'number' || typeof summarizeFunction !== 'function') {
    throw new Error('Invalid Array.from(/* args */{}): text must be a string, chunkSize must be a number, and summarizeFunction must be a function.');
  }

  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  const summaries = chunks.map(chunk => summarizeFunction(chunk));

  return summaries.length > 1
    ? hierarchicalSummarization(summaries.join(' '), chunkSize, summarizeFunction)
    : summaries[0];
}

/**
 * Selects the most relevant contexts based on cosine similarity and recency-weighted scoring.
 * @param {string} query - Query string to match against contexts.
 * @param {Object} contextVectors - Object mapping context IDs to their vector representations.
 * @param {Object} queryVector - Vector representation of the query.
 * @param {number} recencyWeight - Weighting factor for recent contexts (0-1).
 * @returns {string[]} - Array of selected context IDs.
 */
export function selectRelevantContexts(query, contextVectors, queryVector, recencyWeight = 0.5) {
  if (typeof query !== 'string' || typeof contextVectors !== 'object' || !Array.isArray(queryVector)) {
    throw new Error('Invalid Array.from(/* args */{}): query must be a string, contextVectors must be an object, and queryVector must be an array.');
  }

  const scoredContexts = Object.entries(contextVectors).map(([contextId, vector], index) => {
    const similarity = cosineSimilarity(queryVector, vector);
    const importanceScore = (1 - recencyWeight) + recencyWeight * (index / Object.keys(contextVectors).length);
    return { contextId, score: similarity * importanceScore };
  });

  return scoredContexts.sort((a, b) => b.score - a.score).map(entry => entry.contextId);
}
