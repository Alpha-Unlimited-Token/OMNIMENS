/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-01T22:03:25.447Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchicalMemoryManager.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash for a given string to ensure unique identifiers for memory clusters.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Clusters an array of items into groups based on a similarity function.
 * @param {Array} items - The array of items to cluster.
 * @param {function} similarityFunction - A function that takes two items and returns a similarity score (0-1).
 * @returns {Array} - An array of clusters, each cluster being an array of items.
 */
export function clusterItems(items, similarityFunction) {
  const clusters = [];

  for (const item of items) {
    let addedToCluster = false;

    for (const cluster of clusters) {
      const similarityScores = cluster.map(clusterItem => similarityFunction(item, clusterItem));
      const averageSimilarity = similarityScores.reduce((a, b) => a + b, 0) / similarityScores.length;

      if (averageSimilarity > 0.7) { // Threshold for clustering
        cluster.push(item);
        addedToCluster = true;
        break;
      }
    }

    if (!addedToCluster) {
      clusters.push([item]);
    }
  }

  return clusters;
}

/**
 * Summarizes a cluster of items into a single abstract representation.
 * @param {Array} cluster - The cluster of items to summarize.
 * @param {function} summarizerFunction - A function that takes an array of items and returns a summary.
 * @returns {*} - The summary of the cluster.
 */
export function summarizeCluster(cluster, summarizerFunction) {
  return summarizerFunction(cluster);
}

/**
 * Builds hierarchical memory layers from raw context data.
 * @param {Array} contextData - The raw context data to process.
 * @param {function} similarityFunction - A function to measure similarity between items.
 * @param {function} summarizerFunction - A function to summarize clusters.
 * @returns {Array} - Hierarchical memory layers, each layer being an array of summaries.
 */
export function buildHierarchicalMemory(contextData, similarityFunction, summarizerFunction) {
  let currentLayer = contextData;
  const memoryLayers = [];

  while (currentLayer.length > 1) {
    const clusters = clusterItems(currentLayer, similarityFunction);
    const summaries = clusters.map(cluster => summarizeCluster(cluster, summarizerFunction));
    memoryLayers.push(summaries);
    currentLayer = summaries;
  }

  return memoryLayers;
}

/**
 * Example similarity function: computes similarity based on string length difference.
 * @param {string} a - First string.
 * @param {string} b - Second string.
 * @returns {number} - Similarity score (0-1).
 */
export function exampleSimilarityFunction(a, b) {
  const maxLength = Math.max(a.length, b.length);
  const lengthDifference = Math.abs(a.length - b.length);
  return 1 - (lengthDifference / maxLength);
}

/**
 * Example summarizer function: concatenates strings in a cluster.
 * @param {Array} cluster - Array of strings.
 * @returns {string} - Concatenated summary.
 */
export function exampleSummarizerFunction(cluster) {
  return cluster.join(' ');
}

/**
 * Example usage of the hierarchicalMemoryManager.
 * @param {Array} contextData - Array of strings representing raw context.
 * @returns {Array} - Hierarchical memory layers.
 */
export function exampleUsage(contextData) {
  return buildHierarchicalMemory(contextData, exampleSimilarityFunction, exampleSummarizerFunction);
}