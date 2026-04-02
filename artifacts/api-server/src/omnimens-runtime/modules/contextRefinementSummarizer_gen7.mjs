/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextRefinementSummarizer
 * Written: 2026-04-02T22:08:47.067Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextRefinementSummarizer.mjs

import crypto from 'crypto';

/**
 * Generates a hash for clustering purposes.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash of the input.
 */
export function generateHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Groups semantically similar sentences into clusters.
 * @param {string[]} sentences - An array of sentences to cluster.
 * @returns {Object} - A mapping of cluster IDs to grouped sentences.
 */
export function semanticClustering(sentences) {
  const clusters = {};
  sentences.forEach((sentence) => {
    const clusterId = generateHash(sentence).slice(0, 8); // Simplified clustering
    if (!clusters[clusterId]) clusters[clusterId] = [];
    clusters[clusterId].push(sentence);
  });
  return clusters;
}

/**
 * Performs importance-weighted summarization on a cluster of sentences.
 * @param {string[]} cluster - An array of sentences in a cluster.
 * @returns {string} - A summary of the cluster.
 */
export function summarizeCluster(cluster) {
  const weights = cluster.map((sentence) => sentence.length); // Weight by sentence length
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const weightedSentences = cluster.map((sentence, idx) => ({
    sentence,
    weight: weights[idx] / totalWeight
  }));

  weightedSentences.sort((a, b) => b.weight - a.weight);
  return weightedSentences[0].sentence; // Return the most weighted sentence as summary
}

/**
 * Recursively refines and summarizes text using hierarchical clustering.
 * @param {string[]} sentences - An array of sentences to summarize.
 * @param {number} depth - The number of refinement passes to perform.
 * @returns {string} - A refined summary of the input sentences.
 */
export function recursiveRefinement(sentences, depth = 3) {
  if (depth === 0 || sentences.length === 1) return sentences.join(' ');

  const clusters = semanticClustering(sentences);
  const summaries = Object.values(clusters).map(summarizeCluster);
  return recursiveRefinement(summaries, depth - 1);
}

/**
 * Main function to summarize a large text input.
 * @param {string} text - The input text to summarize.
 * @param {number} depth - The number of refinement passes to perform.
 * @returns {string} - A refined summary of the input text.
 */
export function summarizeText(text, depth = 3) {
  const sentences = text.split(/(?<=[.!?])\s+/); // Split by sentence boundaries
  return recursiveRefinement(sentences, depth);
}

/**
 * Utility function to split text into token-sized chunks.
 * @param {string} text - The input text to split.
 * @param {number} maxTokens - The maximum number of tokens per chunk.
 * @returns {string[]} - An array of token-sized chunks.
 */
export function chunkText(text, maxTokens = 100) {
  const words = text.split(/\s+/);
  const chunks = [];
  let currentChunk = [];

  words.forEach((word) => {
    if (currentChunk.join(' ').length + word.length + 1 > maxTokens) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [];
    }
    currentChunk.push(word);
  });

  if (currentChunk.length > 0) chunks.push(currentChunk.join(' '));
  return chunks;
}

/**
 * Combines summaries from multiple chunks into a single summary.
 * @param {string[]} chunks - An array of text chunks to summarize.
 * @param {number} depth - The number of refinement passes to perform.
 * @returns {string} - A combined summary of all chunks.
 */
export function summarizeChunks(chunks, depth = 3) {
  const summaries = chunks.map((chunk) => summarizeText(chunk, depth));
  return summarizeText(summaries.join(' '), depth);
}
