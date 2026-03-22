/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: conversationContextCompressor
 * Written: 2026-03-22T13:46:45.953Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// conversationContextCompressor.js

/**
 * @module conversationContextCompressor
 * @description Summarizes and compresses earlier parts of a conversation using sentence embeddings and clustering
 * to maintain context within a limited token window.
 */

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} Cosine similarity between vectorA and vectorB.
 */
function cosineSimilarity(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Generates a simple sentence embedding by hashing words into a fixed-length vector.
 * @param {string} sentence - Input sentence.
 * @returns {number[]} Fixed-length vector representing the sentence.
 */
function generateEmbedding(sentence) {
  const vectorSize = 128;
  const vector = new Array(vectorSize).fill(0);
  const words = sentence.split(/\s+/);
  const hash = (str) => {
    let hashValue = 0;
    for (let i = 0; i < str.length; i++) {
      hashValue = (hashValue * 31 + str.charCodeAt(i)) % vectorSize;
    }
    return hashValue;
  };
  words.forEach((word) => {
    const index = hash(word);
    vector[index] += 1;
  });
  return vector;
}

/**
 * Clusters sentences based on similarity to reduce redundancy.
 * @param {string[]} sentences - Array of sentences to cluster.
 * @param {number} similarityThreshold - Threshold for cosine similarity to group sentences.
 * @returns {string[]} Clustered and summarized sentences.
 */
function clusterSentences(sentences, similarityThreshold = 0.8) {
  const embeddings = sentences.map(generateEmbedding);
  const clusters = [];

  sentences.forEach((sentence, i) => {
    let addedToCluster = false;
    for (const cluster of clusters) {
      const clusterEmbedding = generateEmbedding(cluster[0]);
      if (cosineSimilarity(embeddings[i], clusterEmbedding) >= similarityThreshold) {
        cluster.push(sentence);
        addedToCluster = true;
        break;
      }
    }
    if (!addedToCluster) {
      clusters.push([sentence]);
    }
  });

  return clusters.map((cluster) => cluster.join(" "));
}

/**
 * Summarizes and compresses the conversation context.
 * @param {string[]} conversation - Array of conversation messages.
 * @param {number} maxLength - Maximum number of sentences in the compressed context.
 * @returns {string[]} Compressed conversation context.
 */
function compressConversation(conversation, maxLength = 10) {
  const clustered = clusterSentences(conversation);
  return clustered.slice(0, maxLength);
}

export { cosineSimilarity, generateEmbedding, clusterSentences, compressConversation };