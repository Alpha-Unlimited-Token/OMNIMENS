/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: slidingContextManager
 * Written: 2026-04-01T22:18:48.633Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// slidingContextManager.mjs

import crypto from 'crypto';

/**
 * Summarizes or chunks older context dynamically to manage token overflow.
 * Implements a centroid-based hierarchical summarization algorithm.
 */

// Utility function to calculate cosine similarity between two vectors
export function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, val, idx) => sum + val * vecB[idx], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
  return dotProduct / (magnitudeA * magnitudeB || 1);
}

// Utility function to compute a centroid from a cluster of vectors
export function computeCentroid(vectors) {
  const dimension = vectors[0].length;
  const centroid = Array(dimension).fill(0);
  vectors.forEach(vector => {
    vector.forEach((val, idx) => {
      centroid[idx] += val;
    });
  });
  return centroid.map(val => val / vectors.length);
}

// Summarizes a list of text chunks using centroid-based clustering
export function summarizeChunks(chunks, embeddingFunction, maxClusters = 5) {
  // Step 1: Generate embeddings for each chunk
  const embeddings = chunks.map(chunk => embeddingFunction(chunk));

  // Step 2: Initialize clusters with the first `maxClusters` embeddings
  const clusters = embeddings.slice(0, maxClusters).map(embedding => ({
    centroid: embedding,
    members: [embedding]
  }));

  // Step 3: Assign remaining embeddings to the nearest cluster
  embeddings.slice(maxClusters).forEach(embedding => {
    let bestCluster = null;
    let bestSimilarity = -Infinity;

    clusters.forEach(cluster => {
      const similarity = cosineSimilarity(embedding, cluster.centroid);
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestCluster = cluster;
      }
    });

    bestCluster.members.push(embedding);
    bestCluster.centroid = computeCentroid(bestCluster.members);
  });

  // Step 4: Summarize each cluster into a single text chunk
  return clusters.map(cluster => {
    const concatenatedText = cluster.members
      .map((_, idx) => chunks[embeddings.indexOf(cluster.members[idx])])
      .join(' ');

    return concatenatedText.slice(0, 500); // Truncate to 500 characters for brevity
  });
}

// Sliding context manager function
export function slidingContextManager(context, embeddingFunction, maxTokens = 2048) {
  const tokenCount = context.reduce((sum, chunk) => sum + chunk.split(' ').length, 0);

  if (tokenCount <= maxTokens) {
    return context; // No summarization needed
  }

  const summarizedChunks = summarizeChunks(context, embeddingFunction);

  // Recursively summarize if still exceeding maxTokens
  return slidingContextManager(summarizedChunks, embeddingFunction, maxTokens);
}

// Example embedding function (hash-based for demonstration purposes)
export function exampleEmbeddingFunction(text) {
  const hash = crypto.createHash('sha256').update(text).digest('hex');
  return Array.from(hash.slice(0, 32)).map(char => char.charCodeAt(0) / 255);
}

// Example usage:
// const context = ["Long text chunk 1", "Long text chunk 2", ...];
// const managedContext = slidingContextManager(context, exampleEmbeddingFunction);
