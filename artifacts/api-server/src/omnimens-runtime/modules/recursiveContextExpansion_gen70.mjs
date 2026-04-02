/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: recursiveContextExpansion
 * Written: 2026-04-02T14:46:03.217Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// recursiveContextExpansion.mjs

import { createHash } from 'crypto';

/**
 * Generates a semantic hash for clustering purposes.
 * @param {string} input - The input string to hash.
 * @returns {string} - A fixed-length hash string.
 */
export function generateSemanticHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex').slice(0, 16); // Shorten for clustering
}

/**
 * Splits a large context into manageable chunks based on token limits.
 * @param {string} context - The large input context.
 * @param {number} chunkSize - Maximum size of each chunk.
 * @returns {string[]} - Array of context chunks.
 */
export function splitContext(context, chunkSize) {
  const chunks = [];
  for (let i = 0; i < context.length; i += chunkSize) {
    chunks.push(context.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Performs recursive embedding generation and refinement.
 * @param {string[]} chunks - Array of context chunks.
 * @param {Function} embeddingFunction - A function to generate embeddings for a chunk.
 * @returns {Array} - Refined hierarchical embeddings.
 */
export async function recursiveEmbedding(chunks, embeddingFunction) {
  let currentLevel = chunks.map(chunk => ({
    chunk,
    embedding: embeddingFunction(chunk)
  }));

  while (currentLevel.length > 1) {
    const nextLevel = [];

    for (let i = 0; i < currentLevel.length; i += 2) {
      const cluster = currentLevel.slice(i, i + 2);
      const combinedChunk = cluster.map(c => c.chunk).join(' ');

      nextLevel.push({
        chunk: combinedChunk,
        embedding: embeddingFunction(combinedChunk)
      });
    }

    currentLevel = nextLevel;
  }

  return currentLevel;
}

/**
 * Calculates cosine similarity between two vectors.
 * @param {number[]} vecA - First vector.
 * @param {number[]} vecB - Second vector.
 * @returns {number} - Cosine similarity score.
 */
export function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Clusters embeddings based on similarity thresholds.
 * @param {Array} embeddings - Array of embeddings to cluster.
 * @param {number} similarityThreshold - Minimum similarity for clustering.
 * @returns {Array} - Array of clusters with grouped embeddings.
 */
export function clusterEmbeddings(embeddings, similarityThreshold) {
  const clusters = [];

  embeddings.forEach(embedding => {
    let addedToCluster = false;

    for (const cluster of clusters) {
      if (cosineSimilarity(cluster[0].embedding, embedding.embedding) >= similarityThreshold) {
        cluster.push(embedding);
        addedToCluster = true;
        break;
      }
    }

    if (!addedToCluster) {
      clusters.push([embedding]);
    }
  });

  return clusters;
}

/**
 * Main function to process a large context using recursive embeddings.
 * @param {string} context - The large input context.
 * @param {number} chunkSize - Maximum size of each chunk.
 * @param {Function} embeddingFunction - A function to generate embeddings for a chunk.
 * @param {number} similarityThreshold - Threshold for clustering embeddings.
 * @returns {Array} - Final processed clusters.
 */
export async function processLargeContext(context, chunkSize, embeddingFunction, similarityThreshold) {
  const chunks = splitContext(context, chunkSize);
  const hierarchicalEmbeddings = await recursiveEmbedding(chunks, embeddingFunction);
  return clusterEmbeddings(hierarchicalEmbeddings, similarityThreshold);
}