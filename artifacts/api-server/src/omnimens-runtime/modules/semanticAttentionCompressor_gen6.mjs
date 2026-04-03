/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticAttentionCompressor
 * Written: 2026-04-03T09:11:31.700Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// semanticAttentionCompressor.mjs

import { createHash } from 'crypto';

/**
 * Computes semantic similarity score between two text inputs using a simple hashing approach.
 * @param {string} textA - First text input.
 * @param {string} textB - Second text input.
 * @returns {number} - Similarity score (0 to 1).
 */
export function computeSemanticSimilarity(textA, textB) {
  const hashA = createHash('sha256').update(textA).digest('hex');
  const hashB = createHash('sha256').update(textB).digest('hex');

  let matches = 0;
  for (let i = 0; i < hashA.length; i++) {
    if (hashA[i] === hashB[i]) matches++;
  }

  return matches / hashA.length;
}

/**
 * Traverses a causal graph to identify key nodes based on importance.
 * @param {Object} graph - Adjacency list representation of the graph.
 * @param {string} startNode - Starting node for traversal.
 * @param {number} depth - Maximum depth to traverse.
 * @returns {Set<string>} - Set of important nodes.
 */
export function traverseCausalGraph(graph, startNode, depth) {
  const visited = new Set();
  const queue = [{ node: startNode, level: 0 }];

  while (queue.length > 0) {
    const { node, level } = queue.shift();

    if (!visited.has(node) && level <= depth) {
      visited.add(node);
      const neighbors = graph[node] || [];
      for (const neighbor of neighbors) {
        queue.push({ node: neighbor, level: level + 1 });
      }
    }
  }

  return visited;
}

/**
 * Compresses a large text input by dynamically prioritizing semantically and causally important information.
 * @param {string[]} textChunks - Array of text chunks to compress.
 * @param {Object} causalGraph - Adjacency list representing causal relationships between chunks.
 * @param {number} maxChunks - Maximum number of chunks to retain.
 * @returns {string[]} - Array of compressed, prioritized text chunks.
 */
export function compressTextWithSemanticAttention(textChunks, causalGraph, maxChunks) {
  // Step 1: Compute semantic similarity scores for all pairs of chunks.
  const similarityScores = [];
  for (let i = 0; i < textChunks.length; i++) {
    for (let j = i + 1; j < textChunks.length; j++) {
      const score = computeSemanticSimilarity(textChunks[i], textChunks[j]);
      similarityScores.push({ pair: [i, j], score });
    }
  }

  // Step 2: Sort pairs by similarity score in descending order.
  similarityScores.sort((a, b) => b.score - a.score);

  // Step 3: Traverse the causal graph to identify key chunks.
  const importantChunks = new Set();
  for (const chunkIndex in textChunks) {
    const nodes = traverseCausalGraph(causalGraph, chunkIndex, 2);
    nodes.forEach((node) => importantChunks.add(node));
  }

  // Step 4: Prioritize chunks based on causal importance and semantic similarity.
  const prioritizedChunks = Array.from(importantChunks).sort((a, b) => {
    const aScore = similarityScores.find((s) => s.pair.includes(a))?.score || 0;
    const bScore = similarityScores.find((s) => s.pair.includes(b))?.score || 0;
    return bScore - aScore;
  });

  // Step 5: Retain only the top N chunks.
  return prioritizedChunks.slice(0, maxChunks).map((index) => textChunks[index]);
}

/**
 * Utility function to create a causal graph from raw relationships.
 * @param {Array<[string, string]>} edges - List of directed edges (from, to).
 * @returns {Object} - Adjacency list representation of the graph.
 */
export function createCausalGraph(edges) {
  const graph = {};
  for (const [from, to] of edges) {
    if (!graph[from]) graph[from] = [];
    graph[from].push(to);
  }
  return graph;
}