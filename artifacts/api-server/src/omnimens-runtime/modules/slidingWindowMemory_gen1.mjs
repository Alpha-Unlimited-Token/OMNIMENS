/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: slidingWindowMemory
 * Written: 2026-03-24T01:58:04.843Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * @module slidingWindowMemory
 * @description Maintains long-term context by summarizing and retaining key conversation points beyond the token window limit.
 */

/**
 * Generates sentence embeddings for input text using a simple hashing-based approach.
 * This is a placeholder for a more sophisticated embedding algorithm.
 * @param {string} text - The input text to embed.
 * @returns {number[]} - A fixed-length numerical vector representing the text.
 */
function generateEmbedding(text) {
  const hash = crypto.createHash('sha256');
  hash.update(text);
  const digest = hash.digest();
  const embedding = Array.from(digest).slice(0, 16).map(byte => byte / 255); // Normalize to [0, 1]
  return embedding;
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vec1 - The first vector.
 * @param {number[]} vec2 - The second vector.
 * @returns {number} - The Euclidean distance between the two vectors.
 */
function calculateDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must be of the same length');
  }
  return Math.sqrt(vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0));
}

/**
 * Clusters embeddings into groups based on a distance threshold.
 * @param {Array<{text: string, embedding: number[]}>} data - Array of objects containing text and embeddings.
 * @param {number} threshold - Maximum distance between points in a cluster.
 * @returns {Array<{cluster: number, texts: string[]}>} - Clustered data with associated texts.
 */
function clusterEmbeddings(data, threshold) {
  const clusters = [];
  data.forEach(item => {
    let addedToCluster = false;
    for (const cluster of clusters) {
      const distances = cluster.embeddings.map(embedding => calculateDistance(item.embedding, embedding));
      if (Math.min(...distances) <= threshold) {
        cluster.embeddings.push(item.embedding);
        cluster.texts.push(item.text);
        addedToCluster = true;
        break;
      }
    }
    if (!addedToCluster) {
      clusters.push({ embeddings: [item.embedding], texts: [item.text] });
    }
  });
  return clusters.map((cluster, index) => ({ cluster: index, texts: cluster.texts }));
}

/**
 * Summarizes a cluster of texts into a single representative summary.
 * @param {string[]} texts - Array of texts to summarize.
 * @returns {string} - A simple concatenated summary of the texts.
 */
function summarizeCluster(texts) {
  return texts.join(' ').slice(0, 200); // Limit summary to 200 characters.
}

/**
 * Maintains a sliding window memory by summarizing and retaining key points.
 * @param {string[]} conversationHistory - Array of conversation strings.
 * @param {number} embeddingThreshold - Distance threshold for clustering.
 * @returns {Array<{summary: string}>} - Array of summaries representing the long-term memory.
 */
function slidingWindowMemory(conversationHistory, embeddingThreshold = 0.5) {
  const data = conversationHistory.map(text => ({ text, embedding: generateEmbedding(text) }));
  const clusters = clusterEmbeddings(data, embeddingThreshold);
  return clusters.map(cluster => ({ summary: summarizeCluster(cluster.texts) }));
}

export { generateEmbedding, calculateDistance, clusterEmbeddings, summarizeCluster, slidingWindowMemory };