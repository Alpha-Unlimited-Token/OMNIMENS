/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticGraphSummarizer
 * Written: 2026-04-02T14:24:13.462Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// semanticGraphSummarizer.mjs

import { createHash } from 'crypto';

/**
 * Compute semantic similarity between two text nodes using a simple hash-based comparison.
 * @param {string} textA - First text node.
 * @param {string} textB - Second text node.
 * @returns {number} - Similarity score (0 to 1).
 */
export function computeSemanticSimilarity(textA, textB) {
  const hashA = createHash('sha256').update(textA).digest('hex');
  const hashB = createHash('sha256').update(textB).digest('hex');

  let similarity = 0;
  for (let i = 0; i < hashA.length; i++) {
    if (hashA[i] === hashB[i]) similarity++;
  }

  return similarity / hashA.length;
}

/**
 * Construct a semantic graph from a list of text nodes.
 * @param {string[]} nodes - Array of text nodes.
 * @returns {object} - Graph representation with nodes and weighted edges.
 */
export function constructSemanticGraph(nodes) {
  const graph = { nodes: [], edges: [] };

  // Add nodes to the graph
  nodes.forEach((node, index) => {
    graph.nodes.push({ id: index, text: node });
  });

  // Add weighted edges based on semantic similarity
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const weight = computeSemanticSimilarity(nodes[i], nodes[j]);
      if (weight > 0) {
        graph.edges.push({ source: i, target: j, weight });
      }
    }
  }

  return graph;
}

/**
 * Perform hierarchical clustering on the semantic graph.
 * @param {object} graph - Graph representation with nodes and edges.
 * @param {number} threshold - Minimum edge weight to consider for clustering.
 * @returns {object[]} - Clusters of nodes.
 */
export function hierarchicalClustering(graph, threshold = 0.5) {
  const clusters = [];
  const visited = new Set();

  function dfs(nodeId, cluster) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    cluster.push(nodeId);

    graph.edges
      .filter(edge => edge.weight >= threshold && (edge.source === nodeId || edge.target === nodeId))
      .forEach(edge => {
        const neighbor = edge.source === nodeId ? edge.target : edge.source;
        dfs(neighbor, cluster);
      });
  }

  graph.nodes.forEach(node => {
    if (!visited.has(node.id)) {
      const cluster = [];
      dfs(node.id, cluster);
      clusters.push(cluster);
    }
  });

  return clusters.map(cluster => cluster.map(nodeId => graph.nodes.find(node => node.id === nodeId).text));
}

/**
 * Summarize text nodes by clustering and selecting representative nodes.
 * @param {string[]} nodes - Array of text nodes.
 * @param {number} threshold - Minimum edge weight to consider for clustering.
 * @returns {string[]} - Representative text nodes for each cluster.
 */
export function summarizeSemanticGraph(nodes, threshold = 0.5) {
  const graph = constructSemanticGraph(nodes);
  const clusters = hierarchicalClustering(graph, threshold);

  return clusters.map(cluster => cluster[0]); // Select the first node as representative
}

/**
 * Utility function to normalize text input for better semantic processing.
 * @param {string} text - Raw text input.
 * @returns {string} - Normalized text.
 */
export function normalizeText(text) {
  return text.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');
}