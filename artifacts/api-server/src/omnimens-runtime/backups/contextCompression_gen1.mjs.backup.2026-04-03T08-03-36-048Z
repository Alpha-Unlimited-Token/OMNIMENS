/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextCompression
 * Written: 2026-03-23T11:17:17.862Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextCompression.js

/**
 * @module contextCompression
 * @description Compresses long conversations into essential summaries using clustering and summarization techniques.
 */

/**
 * Summarizes a conversation by clustering related ideas and distilling them into a compact representation.
 * @param {string[]} conversation - Array of strings representing the conversation.
 * @param {number} clusterCount - Number of clusters to form for summarization.
 * @returns {string[]} - Array of key summary strings representing the compressed context.
 */
export function compressContext(conversation, clusterCount = 3) {
  if (!Array.isArray(conversation) || conversation.length === 0) {
    throw new Error("Invalid conversation input. Must be a non-empty array of strings.");
  }

  if (typeof clusterCount !== "number" || clusterCount <= 0) {
    throw new Error("Invalid clusterCount input. Must be a positive integer.");
  }

  // Step 1: Tokenize and preprocess conversation
  const tokenizedSentences = conversation.map((sentence) => tokenize(sentence));

  // Step 2: Calculate sentence similarity matrix
  const similarityMatrix = calculateSimilarityMatrix(tokenizedSentences);

  // Step 3: Perform clustering
  const clusters = kMeansClustering(similarityMatrix, clusterCount);

  // Step 4: Summarize each cluster
  const summaries = clusters.map((cluster) => summarizeCluster(cluster, conversation));

  return summaries;
}

/**
 * Tokenizes a sentence into an array of words.
 * @param {string} sentence - The sentence to tokenize.
 * @returns {string[]} - Array of words.
 */
function tokenize(sentence) {
  return sentence
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 0);
}

/**
 * Calculates a similarity matrix for an array of tokenized sentences.
 * @param {string[][]} tokenizedSentences - Array of tokenized sentences.
 * @returns {number[][]} - 2D array representing sentence similarity scores.
 */
function calculateSimilarityMatrix(tokenizedSentences) {
  const matrix = [];

  for (let i = 0; i < tokenizedSentences.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < tokenizedSentences.length; j++) {
      matrix[i][j] = calculateSimilarity(tokenizedSentences[i], tokenizedSentences[j]);
    }
  }

  return matrix;
}

/**
 * Calculates similarity between two tokenized sentences using Jaccard similarity.
 * @param {string[]} tokensA - Tokenized sentence A.
 * @param {string[]} tokensB - Tokenized sentence B.
 * @returns {number} - Similarity score between 0 and 1.
 */
function calculateSimilarity(tokensA, tokensB) {
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  const intersection = new Set([...setA].filter((x) => setB.has(x))).size;
  const union = new Set([...setA, ...setB]).size;

  return intersection / union;
}

/**
 * Performs k-means clustering on a similarity matrix.
 * @param {number[][]} similarityMatrix - 2D array representing sentence similarity scores.
 * @param {number} k - Number of clusters.
 * @returns {number[][]} - Array of clusters, each containing indices of sentences.
 */
function kMeansClustering(similarityMatrix, k) {
  const n = similarityMatrix.length;
  const centroids = Array.from({ length: k }, () => Math.floor(Math.random() * n));
  let clusters = Array.from({ length: k }, () => []);
  let previousCentroids;

  do {
    previousCentroids = [...centroids];
    clusters = Array.from({ length: k }, () => []);

    for (let i = 0; i < n; i++) {
      let closestCentroid = 0;
      let maxSimilarity = -Infinity;

      for (let j = 0; j < k; j++) {
        if (similarityMatrix[i][centroids[j]] > maxSimilarity) {
          maxSimilarity = similarityMatrix[i][centroids[j]];
          closestCentroid = j;
        }
      }

      clusters[closestCentroid].push(i);
    }

    centroids = clusters.map((cluster) => {
      const clusterSimilarity = cluster.map((index) => similarityMatrix[index]);
      const averageSimilarity = clusterSimilarity.reduce((acc, row) => {
        return acc.map((sum, i) => sum + row[i]);
      }, Array(n).fill(0)).map((sum) => sum / cluster.length);

      return averageSimilarity.indexOf(Math.max(...averageSimilarity));
    });
  } while (!centroids.every((c, i) => c === previousCentroids[i]));

  return clusters;
}

/**
 * Summarizes a cluster by selecting the most representative sentence.
 * @param {number[]} cluster - Array of indices representing sentences in the cluster.
 * @param {string[]} conversation - Original conversation array.
 * @returns {string} - Summary of the cluster.
 */
function summarizeCluster(cluster, conversation) {
  let representativeSentence = "";
  let maxScore = -Infinity;

  for (const index of cluster) {
    const score = cluster.reduce((sum, otherIndex) => sum + calculateSimilarity(
      tokenize(conversation[index]),
      tokenize(conversation[otherIndex])
    ), 0);

    if (score > maxScore) {
      maxScore = score;
      representativeSentence = conversation[index];
    }
  }

  return representativeSentence;
}

export default { compressContext };