/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticGraphCompressor
 * Written: 2026-04-01T22:14:45.540Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// semanticGraphCompressor.mjs

import { createHash } from 'crypto';

/**
 * Generates a semantic graph from a list of tokens.
 * @param {string[]} tokens - Array of tokens to analyze.
 * @param {function} similarityFunction - Function to compute similarity between tokens.
 * @returns {Map<string, Set<string>>} - Graph represented as adjacency list.
 */
export function generateSemanticGraph(tokens, similarityFunction) {
  const graph = new Map();

  for (let i = 0; i < tokens.length; i++) {
    const tokenA = tokens[i];
    if (!graph.has(tokenA)) graph.set(tokenA, new Set());

    for (let j = i + 1; j < tokens.length; j++) {
      const tokenB = tokens[j];
      if (similarityFunction(tokenA, tokenB)) {
        graph.get(tokenA).add(tokenB);
        if (!graph.has(tokenB)) graph.set(tokenB, new Set());
        graph.get(tokenB).add(tokenA);
      }
    }
  }

  return graph;
}

/**
 * Performs graph clustering to identify key nodes.
 * @param {Map<string, Set<string>>} graph - Graph represented as adjacency list.
 * @returns {Set<string>} - Set of key nodes (summarized tokens).
 */
export function clusterGraph(graph) {
  const visited = new Set();
  const keyNodes = new Set();

  for (const node of graph.keys()) {
    if (visited.has(node)) continue;

    const cluster = new Set();
    const queue = [node];

    while (queue.length > 0) {
      const current = queue.pop();
      if (visited.has(current)) continue;

      visited.add(current);
      cluster.add(current);

      for (const neighbor of graph.get(current) || []) {
        if (!visited.has(neighbor)) queue.push(neighbor);
      }
    }

    // Select a representative node for the cluster (e.g., the most connected node).
    let representative = null;
    let maxConnections = -1;

    for (const candidate of cluster) {
      const connections = graph.get(candidate)?.size || 0;
      if (connections > maxConnections) {
        representative = candidate;
        maxConnections = connections;
      }
    }

    if (representative) keyNodes.add(representative);
  }

  return keyNodes;
}

/**
 * Computes a simple token similarity based on hash prefix matching.
 * @param {string} tokenA - First token.
 * @param {string} tokenB - Second token.
 * @returns {boolean} - True if tokens are similar.
 */
export function simpleSimilarityFunction(tokenA, tokenB) {
  const hashA = createHash('sha256').update(tokenA).digest('hex');
  const hashB = createHash('sha256').update(tokenB).digest('hex');
  return hashA.slice(0, 5) === hashB.slice(0, 5); // Compare first 5 characters of hash.
}

/**
 * Compresses a list of tokens by summarizing them using semantic graph clustering.
 * @param {string[]} tokens - Array of tokens to compress.
 * @returns {string[]} - Summarized tokens.
 */
export function compressTokens(tokens) {
  const graph = generateSemanticGraph(tokens, simpleSimilarityFunction);
  const keyNodes = clusterGraph(graph);
  return Array.from(keyNodes);
}

/**
 * Utility to calculate graph density.
 * @param {Map<string, Set<string>>} graph - Graph represented as adjacency list.
 * @returns {number} - Density of the graph.
 */
export function calculateGraphDensity(graph) {
  let edgeCount = 0;
  for (const neighbors of graph.values()) {
    edgeCount += neighbors.size;
  }

  const nodeCount = graph.size;
  return nodeCount > 1 ? edgeCount / (nodeCount * (nodeCount - 1)) : 0;
}

/**
 * Utility to visualize graph as a string.
 * @param {Map<string, Set<string>>} graph - Graph represented as adjacency list.
 * @returns {string} - String representation of the graph.
 */
export function visualizeGraph(graph) {
  let output = '';
  for (const [node, neighbors] of graph.entries()) {
    output += `${node} -> [${Array.from(neighbors).join(', ')}]\n`;
  }
  return output;
}