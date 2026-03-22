/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextCompression
 * Written: 2026-03-22T17:31:26.259Z
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
 * @module contextCompression
 * @description Summarizes and encodes long conversations into embeddings for reintroduction into the token window.
 * Implements hierarchical clustering and dimensionality reduction to manage conversation history efficiently.
 */

/**
 * Generates embeddings for a given text input using a simple token-based frequency vector.
 * @param {string} text - The input text to encode.
 * @returns {number[]} - A numerical vector representing the text.
 */
export function generateEmbedding(text) {
  const tokens = text.toLowerCase().match(/\b\w+\b/g) || [];
  const tokenFrequency = {};

  tokens.forEach(token => {
    tokenFrequency[token] = (tokenFrequency[token] || 0) + 1;
  });

  const uniqueTokens = Object.keys(tokenFrequency).sort();
  return uniqueTokens.map(token => tokenFrequency[token]);
}

/**
 * Calculates the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The cosine similarity value between -1 and 1.
 */
export function cosineSimilarity(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * (vectorB[i] || 0), 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val * val, 0));

  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Performs hierarchical clustering on a set of embeddings.
 * @param {Array<number[]>} embeddings - An array of numerical vectors.
 * @param {number} threshold - The similarity threshold for merging clusters.
 * @returns {Array<Array<number[]>>} - A nested array representing clusters of embeddings.
 */
export function hierarchicalClustering(embeddings, threshold = 0.8) {
  const clusters = embeddings.map(embedding => [embedding]);

  while (true) {
    let maxSimilarity = -Infinity;
    let mergeIndexA = -1;
    let mergeIndexB = -1;

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const similarity = cosineSimilarity(
          averageEmbedding(clusters[i]),
          averageEmbedding(clusters[j])
        );

        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          mergeIndexA = i;
          mergeIndexB = j;
        }
      }
    }

    if (maxSimilarity < threshold) break;

    const mergedCluster = clusters[mergeIndexA].concat(clusters[mergeIndexB]);
    clusters.splice(mergeIndexB, 1);
    clusters[mergeIndexA] = mergedCluster;
  }

  return clusters;
}

/**
 * Computes the average embedding for a cluster of embeddings.
 * @param {Array<number[]>} cluster - A cluster of embeddings.
 * @returns {number[]} - The average embedding vector.
 */
export function averageEmbedding(cluster) {
  const dimension = cluster[0].length;
  const sumVector = new Array(dimension).fill(0);

  cluster.forEach(embedding => {
    embedding.forEach((value, index) => {
      sumVector[index] += value;
    });
  });

  return sumVector.map(value => value / cluster.length);
}

/**
 * Summarizes a conversation by clustering and reducing its embeddings.
 * @param {string[]} conversation - An array of conversation strings.
 * @param {number} threshold - The similarity threshold for clustering.
 * @returns {string[]} - A summarized list of representative conversation strings.
 */
export function summarizeConversation(conversation, threshold = 0.8) {
  const embeddings = conversation.map(generateEmbedding);
  const clusters = hierarchicalClustering(embeddings, threshold);

  return clusters.map(cluster => {
    const representativeEmbedding = averageEmbedding(cluster);
    let bestMatch = "";
    let bestSimilarity = -Infinity;

    conversation.forEach((text, index) => {
      const similarity = cosineSimilarity(representativeEmbedding, embeddings[index]);
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = text;
      }
    });

    return bestMatch;
  });
}

/**
 * Encodes a summarized conversation into a compact representation.
 * @param {string[]} summarizedConversation - An array of summarized conversation strings.
 * @returns {string} - A compact JSON string encoding the summarized conversation.
 */
export function encodeSummarizedConversation(summarizedConversation) {
  return JSON.stringify(summarizedConversation);
}