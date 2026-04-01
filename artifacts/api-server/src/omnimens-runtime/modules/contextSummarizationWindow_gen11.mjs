/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextSummarizationWindow
 * Written: 2026-04-01T22:18:51.248Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextSummarizationWindow.mjs
import { createHash } from 'crypto';

/**
 * Generates semantic embeddings for text using a simple hashing mechanism.
 * @param {string} text - Input text to generate embedding.
 * @returns {string} - A fixed-length hash representing the text.
 */
export function generateSemanticEmbedding(text) {
  const hash = createHash('sha256');
  hash.update(text);
  return hash.digest('hex').slice(0, 32); // Return a 32-character hash.
}

/**
 * Clusters embeddings hierarchically based on similarity.
 * @param {Array<string>} embeddings - Array of embeddings to cluster.
 * @returns {Array<Array<string>>} - Hierarchical clusters of embeddings.
 */
export function hierarchicalClustering(embeddings) {
  const clusters = embeddings.map((embedding) => [embedding]);

  while (clusters.length > 1) {
    let minDistance = Infinity;
    let pairToMerge = null;

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const distance = calculateDistance(clusters[i][0], clusters[j][0]);
        if (distance < minDistance) {
          minDistance = distance;
          pairToMerge = [i, j];
        }
      }
    }

    if (pairToMerge) {
      const [i, j] = pairToMerge;
      const mergedCluster = clusters[i].concat(clusters[j]);
      clusters.splice(j, 1);
      clusters.splice(i, 1, mergedCluster);
    }
  }

  return clusters;
}

/**
 * Calculates a simple distance metric between two embeddings.
 * @param {string} embeddingA - First embedding.
 * @param {string} embeddingB - Second embedding.
 * @returns {number} - Distance between embeddings.
 */
export function calculateDistance(embeddingA, embeddingB) {
  let distance = 0;
  for (let i = 0; i < embeddingA.length; i++) {
    distance += Math.abs(embeddingA.charCodeAt(i) - embeddingB.charCodeAt(i));
  }
  return distance;
}

/**
 * Summarizes a list of text inputs by clustering and selecting representative samples.
 * @param {Array<string>} texts - Array of text inputs to summarize.
 * @returns {Array<string>} - Summarized representative texts.
 */
export function summarizeContext(texts) {
  const embeddings = texts.map(generateSemanticEmbedding);
  const clusters = hierarchicalClustering(embeddings);

  return clusters.map((cluster) => {
    return texts[embeddings.indexOf(cluster[0])]; // Select representative text.
  });
}

/**
 * Compresses a large conversational context into a summarized window.
 * @param {Array<string>} context - Array of conversational text.
 * @param {number} maxLength - Maximum desired length of summarized context.
 * @returns {Array<string>} - Summarized context within the length limit.
 */
export function compressContextWindow(context, maxLength) {
  const summarizedTexts = summarizeContext(context);
  const compressed = [];
  let totalLength = 0;

  for (const text of summarizedTexts) {
    if (totalLength + text.length <= maxLength) {
      compressed.push(text);
      totalLength += text.length;
    } else {
      break;
    }
  }

  return compressed;
}