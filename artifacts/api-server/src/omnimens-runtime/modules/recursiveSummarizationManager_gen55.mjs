/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: recursiveSummarizationManager
 * Written: 2026-04-02T15:29:05.884Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// recursiveSummarizationManager.mjs

import { createHash } from 'crypto';

/**
 * Generate a hash for a given string (used for clustering consistency).
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash of the input string.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Compute cosine similarity between two vectors.
 * @param {number[]} vecA - First vector.
 * @param {number[]} vecB - Second vector.
 * @returns {number} - Cosine similarity between the two vectors.
 */
export function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Cluster embeddings hierarchically based on cosine similarity.
 * @param {Array<{ id, embedding}>} embeddings - Array of objects with id and embedding.
 * @param {number} threshold - Similarity threshold for clustering.
 * @returns {Array<Array<{ id, embedding}>>} - Hierarchical clusters.
 */
export function clusterEmbeddings(embeddings, threshold = 0.8) {
  const clusters = [];

  embeddings.forEach((current) => {
    let added = false;
    for (const cluster of clusters) {
      const similarity = cosineSimilarity(current.embedding, cluster[0].embedding);
      if (similarity >= threshold) {
        cluster.push(current);
        added = true;
        break;
      }
    }
    if (!added) clusters.push([current]);
  });

  return clusters;
}

/**
 * Perform extractive summarization on a cluster of text data.
 * @param {Array<string>} texts - Array of text snippets.
 * @returns {string} - Extractive summary of the cluster.
 */
export function extractiveSummarization(texts) {
  const wordFrequency = {};

  texts.forEach((text) => {
    text.split(/\s+/).forEach((word) => {
      const normalized = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalized) wordFrequency[normalized] = (wordFrequency[normalized] || 0) + 1;
    });
  });

  const sortedWords = Object.entries(wordFrequency).sort((a, b) => b[1] - a[1]);
  const summary = sortedWords.slice(0, 10).map(([word]) => word).join(' ');

  return `Summary: ${summary}`;
}

/**
 * Recursive summarization manager to process large token windows.
 * @param {Array<{ id, text, embedding}>} data - Array of objects with id, text, and embedding.
 * @param {number} threshold - Similarity threshold for clustering.
 * @param {number} maxDepth - Maximum recursion depth.
 * @returns {Array<{ id, summary}>} - Summarized data at the top hierarchy.
 */
export function recursiveSummarizationManager(data, threshold = 0.8, maxDepth = 3) {
  if (maxDepth <= 0 || data.length <= 1) {
    return data.map(({ id, text }) => ({ id, summary: extractiveSummarization([text]) }));
  }

  const embeddings = data.map(({ id, embedding }) => ({ id, embedding }));
  const clusters = clusterEmbeddings(embeddings, threshold);

  return clusters.map((cluster) => {
    const clusterData = cluster.map(({ id }) => data.find((item) => item.id === id));
    const combinedText = clusterData.map(({ text }) => text);
    const summary = extractiveSummarization(combinedText);

    return {
      id: generateHash(combinedText.join(' ')),
      summary,
      children: recursiveSummarizationManager(clusterData, threshold, maxDepth - 1)
    };
  });
}

/**
 * Utility to flatten hierarchical summaries into a single layer.
 * @param {Array<{ id, summary, children?: any[] }>} hierarchy - Hierarchical summary data.
 * @returns {Array<{ id, summary}>} - Flattened summaries.
 */
export function flattenSummaries(hierarchy) {
  const flat = [];

  hierarchy.forEach(({ id, summary, children }) => {
    flat.push({ id, summary });
    if (children) flat.push(...flattenSummaries(children));
  });

  return flat;
}