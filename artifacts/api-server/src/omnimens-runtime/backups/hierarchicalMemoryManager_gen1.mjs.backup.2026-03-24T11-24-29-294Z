/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-03-22T08:19:09.130Z
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
 * @module hierarchicalMemoryManager
 * @description Enables long-term context recall by compressing and storing older conversation data using clustering and summarization techniques.
 */

/**
 * Clusters conversation data into semantically similar groups.
 * @param {Array<string>} data - Array of conversation strings.
 * @param {number} clusterCount - Number of clusters to create.
 * @returns {Array<Array<string>>} - Array of clusters, each containing semantically similar strings.
 */
export function clusterConversations(data, clusterCount) {
  if (!Array.isArray(data) || typeof clusterCount !== 'number' || clusterCount <= 0) {
    throw new Error('Invalid input: data must be an array of strings and clusterCount must be a positive number.');
  }

  // Simple k-means-like clustering based on string similarity (Levenshtein distance approximation)
  const clusters = Array.from({ length: clusterCount }, () => []);
  const centroids = data.slice(0, clusterCount); // Initial centroids are the first N items

  for (let iteration = 0; iteration < 10; iteration++) { // Limit iterations to prevent infinite loops
    clusters.forEach(cluster => cluster.length = 0); // Clear clusters

    // Assign each string to the closest centroid
    for (const str of data) {
      let closestIndex = 0;
      let minDistance = Infinity;

      for (let i = 0; i < centroids.length; i++) {
        const distance = levenshteinDistance(str, centroids[i]);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }

      clusters[closestIndex].push(str);
    }

    // Update centroids to be the average of their clusters
    for (let i = 0; i < clusters.length; i++) {
      if (clusters[i].length > 0) {
        centroids[i] = summarizeCluster(clusters[i]);
      }
    }
  }

  return clusters;
}

/**
 * Summarizes a cluster of conversation strings into a single representative string.
 * @param {Array<string>} cluster - Array of strings within a single cluster.
 * @returns {string} - A summarized representation of the cluster.
 */
export function summarizeCluster(cluster) {
  if (!Array.isArray(cluster) || cluster.length === 0) {
    throw new Error('Invalid input: cluster must be a non-empty array of strings.');
  }

  // Simple summarization by finding the most common words
  const wordCounts = {};

  for (const str of cluster) {
    const words = str.split(/\s+/);
    for (const word of words) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  }

  const sortedWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);
  const summary = sortedWords.slice(0, 10).map(([word]) => word).join(' ');

  return summary;
}

/**
 * Calculates the Levenshtein distance between two strings.
 * @param {string} a - First string.
 * @param {string} b - Second string.
 * @returns {number} - The Levenshtein distance between the two strings.
 */
export function levenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) {
    for (let j = 0; j <= b.length; j++) {
      if (i === 0) {
        matrix[i][j] = j;
      } else if (j === 0) {
        matrix[i][j] = i;
      } else if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // Deletion
          matrix[i][j - 1] + 1, // Insertion
          matrix[i - 1][j - 1] + 1 // Substitution
        );
      }
    }
  }

  return matrix[a.length][b.length];
}

/**
 * Compresses and stores conversation data for long-term recall.
 * @param {Array<string>} data - Array of conversation strings.
 * @param {number} clusterCount - Number of clusters to create for compression.
 * @returns {Array<string>} - Array of summarized strings representing the clusters.
 */
export function compressAndStore(data, clusterCount) {
  const clusters = clusterConversations(data, clusterCount);
  return clusters.map(summarizeCluster);
}