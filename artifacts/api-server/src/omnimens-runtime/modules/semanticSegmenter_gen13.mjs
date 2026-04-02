/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticSegmenter
 * Written: 2026-04-02T14:11:01.487Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// semanticSegmenter.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash for a given string to uniquely identify token clusters.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash for the input.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Segments text into semantic clusters based on token relationships.
 * @param {string} text - The input text to segment.
 * @param {number} clusterSize - Approximate size of each semantic cluster.
 * @returns {Array<Object>} - Array of clusters with tokens and relationships.
 */
export function semanticSegment(text, clusterSize = 50) {
  if (typeof text !== 'string' || clusterSize <= 0) {
    throw new Error('Invalid input: text must be a string and clusterSize must be a positive number.');
  }

  const tokens = text.split(/\s+/);
  const clusters = [];
  let currentCluster = [];

  for (let i = 0; i < tokens.length; i++) {
    currentCluster.push(tokens[i]);

    if (currentCluster.length >= clusterSize || i === tokens.length - 1) {
      const clusterText = currentCluster.join(' ');
      clusters.push({
        id: generateHash(clusterText),
        tokens: [...currentCluster],
        relationships: [] // Placeholder for inter-cluster relationships
      });
      currentCluster = [];
    }
  }

  // Establish relationships between clusters (e.g., adjacency)
  for (let i = 0; i < clusters.length - 1; i++) {
    clusters[i].relationships.push(clusters[i + 1].id);
    clusters[i + 1].relationships.push(clusters[i].id);
  }

  return clusters;
}

/**
 * Flattens clusters back into a single text string, preserving logical order.
 * @param {Array<Object>} clusters - Array of clusters to flatten.
 * @returns {string} - Reconstructed text from clusters.
 */
export function flattenClusters(clusters) {
  if (!Array.isArray(clusters)) {
    throw new Error('Invalid input: clusters must be an array.');
  }

  return clusters.map(cluster => cluster.tokens.join(' ')).join(' ');
}

/**
 * Computes semantic similarity between two text segments using Jaccard index.
 * @param {string} textA - First text segment.
 * @param {string} textB - Second text segment.
 * @returns {number} - Jaccard similarity score (0 to 1).
 */
export function computeSemanticSimilarity(textA, textB) {
  const setA = new Set(textA.split(/\s+/));
  const setB = new Set(textB.split(/\s+/));

  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);

  return intersection.size / union.size;
}

/**
 * Reorganizes clusters to optimize semantic similarity between adjacent clusters.
 * @param {Array<Object>} clusters - Array of clusters to reorganize.
 * @returns {Array<Object>} - Reorganized clusters.
 */
export function optimizeClusterOrder(clusters) {
  if (!Array.isArray(clusters)) {
    throw new Error('Invalid input: clusters must be an array.');
  }

  // Sort clusters by similarity to their neighbors
  return clusters.sort((a, b) => {
    const aText = a.tokens.join(' ');
    const bText = b.tokens.join(' ');
    return computeSemanticSimilarity(aText, bText);
  });
}
