/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticGraphCompressor
 * Written: 2026-04-02T14:13:41.424Z
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

import crypto from 'crypto';

/**
 * Generates a semantic graph from a token window.
 * @param {Array<string>} tokens - Array of tokens to process.
 * @returns {Object} - A graph representation where nodes are tokens and edges represent relationships.
 */
export function generateSemanticGraph(tokens) {
  const graph = {};

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!graph[token]) {
      graph[token] = new Set();
    }

    // Create edges with neighboring tokens within a fixed window size
    const windowSize = 2; // Adjustable parameter
    for (let j = Math.max(0, i - windowSize); j <= Math.min(tokens.length - 1, i + windowSize); j++) {
      if (i !== j) {
        graph[token].add(tokens[j]);
      }
    }
  }

  // Convert sets to arrays for easier serialization
  for (const key in graph) {
    graph[key] = Array.from(graph[key]);
  }

  return graph;
}

/**
 * Clusters a semantic graph to retain key relationships.
 * @param {Object} graph - The semantic graph to cluster.
 * @param {number} clusterThreshold - Minimum number of connections to retain a node.
 * @returns {Object} - A compressed graph with only key relationships.
 */
export function clusterSemanticGraph(graph, clusterThreshold = 2) {
  const compressedGraph = {};

  for (const node in graph) {
    const neighbors = graph[node];

    // Retain nodes with sufficient connections
    if (neighbors.length >= clusterThreshold) {
      compressedGraph[node] = neighbors.filter(
        (neighbor) => graph[neighbor] && graph[neighbor].length >= clusterThreshold
      );
    }
  }

  return compressedGraph;
}

/**
 * Hashes a graph for efficient comparison or storage.
 * @param {Object} graph - The graph to hash.
 * @returns {string} - A SHA-256 hash of the graph.
 */
export function hashGraph(graph) {
  const graphString = JSON.stringify(graph);
  return crypto.createHash('sha256').update(graphString).digest('hex');
}

/**
 * Main function to compress token windows using semantic graph summarization.
 * @param {Array<string>} tokens - Array of tokens to process.
 * @param {number} clusterThreshold - Minimum connections for clustering.
 * @returns {Object} - The compressed semantic graph.
 */
export function compressTokenWindow(tokens, clusterThreshold = 2) {
  const graph = generateSemanticGraph(tokens);
  return clusterSemanticGraph(graph, clusterThreshold);
}

/**
 * Utility function to validate a graph structure.
 * @param {Object} graph - The graph to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function validateGraph(graph) {
  if (typeof graph !== 'object' || graph === null) return false;

  for (const key in graph) {
    if (!Array.isArray(graph[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Example usage of the module.
 * @param {Array<string>} tokens - Array of tokens to process.
 * @param {number} clusterThreshold - Minimum connections for clustering.
 * @returns {void}
 */
export function exampleUsage(tokens, clusterThreshold = 2) {
  const compressedGraph = compressTokenWindow(tokens, clusterThreshold);
  console.log('Compressed Graph:', compressedGraph);
  console.log('Graph Hash:', hashGraph(compressedGraph));
}
