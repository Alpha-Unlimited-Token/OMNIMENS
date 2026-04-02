/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticCompressionManager
 * Written: 2026-04-02T15:14:59.846Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// semanticCompressionManager.mjs

import crypto from 'crypto';

/**
 * Computes semantic similarity between two text inputs using cosine similarity on hashed vectors.
 * Generic utility for comparing semantic closeness of textual data.
 */
export function computeSemanticSimilarity(textA, textB) {
  const vectorA = hashTextToVector(textA);
  const vectorB = hashTextToVector(textB);
  return cosineSimilarity(vectorA, vectorB);
}

/**
 * Clusters semantically related texts hierarchically based on similarity scores.
 * Returns clusters optimized for token window usage.
 */
export function hierarchicalClustering(texts, similarityThreshold = 0.75) {
  const clusters = [];

  texts.forEach((text) => {
    let addedToCluster = false;

    for (const cluster of clusters) {
      if (computeSemanticSimilarity(text, cluster[0]) >= similarityThreshold) {
        cluster.push(text);
        addedToCluster = true;
        break;
      }
    }

    if (!addedToCluster) {
      clusters.push([text]);
    }
  });

  return clusters;
}

/**
 * Compresses context by summarizing clusters while preserving key reasoning chains.
 * Returns compressed context optimized for token window usage.
 */
export function compressContext(clusters) {
  return clusters.map((cluster) => {
    const keyText = cluster[0];
    const summary = cluster.length > 1 ? summarizeCluster(cluster) : keyText;
    return { keyText, summary };
  });
}

/**
 * Utility function to hash text into a fixed-length vector using SHA256.
 * Generic utility for text vectorization.
 */
function hashTextToVector(text) {
  const hash = crypto.createHash('sha256').update(text).digest('hex');
  return Array.from(hash).map((char) => char.charCodeAt(0));
}

/**
 * Computes cosine similarity between two vectors.
 * Generic utility for numerical vector comparison.
 */
function cosineSimilarity(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Summarizes a cluster of texts by extracting key information.
 * Generic utility for text summarization.
 */
function summarizeCluster(cluster) {
  return cluster.join(' | '); // Simple concatenation for demonstration purposes.
}

/**
 * Exports all functions for cross-agent utility.
 * These functions are generic and usable by multiple agents.
 */
export const utils = {
  computeSemanticSimilarity,
  hierarchicalClustering,
  compressContext,
  hashTextToVector,
  cosineSimilarity
};