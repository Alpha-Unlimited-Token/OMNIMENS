/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextSummarizationMemory
 * Written: 2026-04-01T22:11:17.468Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextSummarizationMemory.mjs

import { createHash } from 'crypto';

/**
 * Generate a semantic hash for a given text input using SHA-256.
 * This ensures unique identification of semantically similar text blocks.
 * @param {string} text - The input text to hash.
 * @returns {string} - The generated hash.
 */
export function generateSemanticHash(text) {
  const hash = createHash('sha256');
  hash.update(text);
  return hash.digest('hex');
}

/**
 * Cluster text blocks based on semantic similarity using hierarchical clustering.
 * @param {Array<{ id, text}>} blocks - Array of text blocks with unique IDs.
 * @param {function(string, string): number} distanceFunction - A function to calculate semantic distance between two text blocks.
 * @param {number} threshold - The maximum distance for clustering.
 * @returns {Array<{ clusterId, members }>} - Array of clusters with their members.
 */
export function clusterTextBlocks(blocks, distanceFunction, threshold) {
  const clusters = [];

  blocks.forEach((block) => {
    let addedToCluster = false;

    for (const cluster of clusters) {
      const distances = cluster.members.map((member) => distanceFunction(block.text, member.text));
      const minDistance = Math.min(...distances);

      if (minDistance <= threshold) {
        cluster.members.push(block);
        addedToCluster = true;
        break;
      }
    }

    if (!addedToCluster) {
      clusters.push({
        clusterId: generateSemanticHash(block.text),
        members: [block]
      });
    }
  });

  return clusters;
}

/**
 * Summarize a cluster of text blocks by extracting key concepts.
 * @param {Array<{ id, text}>} cluster - Array of text blocks in a cluster.
 * @returns {string} - The summarized representation of the cluster.
 */
export function summarizeCluster(cluster) {
  const combinedText = cluster.map((block) => block.text).join(' ');
  const words = combinedText.split(/\s+/);
  const wordFrequency = {};

  words.forEach((word) => {
    const normalizedWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalizedWord) {
      wordFrequency[normalizedWord] = (wordFrequency[normalizedWord] || 0) + 1;
    }
  });

  const sortedWords = Object.entries(wordFrequency)
    .sort(([, freqA], [, freqB]) => freqB - freqA)
    .map(([word]) => word);

  return sortedWords.slice(0, 10).join(' '); // Return the top 10 most frequent words as the summary.
}

/**
 * Main function to dynamically summarize and compress context.
 * @param {Array<{ id, text}>} contextBlocks - Array of context blocks with unique IDs.
 * @param {function(string, string): number} distanceFunction - A function to calculate semantic distance between two text blocks.
 * @param {number} threshold - The maximum distance for clustering.
 * @returns {Array<{ clusterId, summary, members }>} - Array of summarized clusters.
 */
export function summarizeContext(contextBlocks, distanceFunction, threshold) {
  const clusters = clusterTextBlocks(contextBlocks, distanceFunction, threshold);

  return clusters.map((cluster) => ({
    clusterId: cluster.clusterId,
    summary: summarizeCluster(cluster.members),
    members: cluster.members
  }));
}

/**
 * Example semantic distance function using Jaccard similarity.
 * @param {string} textA - First text input.
 * @param {string} textB - Second text input.
 * @returns {number} - The semantic distance (lower is more similar).
 */
export function jaccardDistance(textA, textB) {
  const setA = new Set(textA.toLowerCase().split(/\s+/));
  const setB = new Set(textB.toLowerCase().split(/\s+/));

  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);

  return 1 - intersection.size / union.size; // Jaccard distance = 1 - similarity.
}

// Example Usage (Uncomment to test in Node.js):
// const contextBlocks = [
//   { id: '1', text: 'AI is transforming the world.' },
//   { id: '2', text: 'Artificial intelligence is changing industries.' },
//   { id: '3', text: 'The weather is nice today.' },
// ];
// const result = summarizeContext(contextBlocks, jaccardDistance, 0.5);
// console.log(result);