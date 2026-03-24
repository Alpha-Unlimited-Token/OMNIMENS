/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: graphContextSummarizer
 * Written: 2026-03-24T06:07:53.071Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// graphContextSummarizer.mjs

import { createHash } from 'crypto';

/**
 * Utility function to compute semantic similarity between two token sequences.
 * @param {string[]} tokensA - First sequence of tokens.
 * @param {string[]} tokensB - Second sequence of tokens.
 * @returns {number} - Similarity score between 0 and 1.
 */
export function computeSemanticSimilarity(tokensA, tokensB) {
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersection = new Set([...setA].filter(token => setB.has(token)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

/**
 * Constructs a semantic graph from token sequences.
 * @param {Array<{ id, tokens }>} contexts - Array of contexts with unique IDs and token sequences.
 * @returns {Object} - Graph representation (nodes and edges).
 */
export function constructSemanticGraph(contexts) {
  const graph = { nodes: [], edges: [] };

  for (const context of contexts) {
    graph.nodes.push({ id: context.id, tokens: context.tokens });
  }

  for (let i = 0; i < contexts.length; i++) {
    for (let j = i + 1; j < contexts.length; j++) {
      const similarity = computeSemanticSimilarity(contexts[i].tokens, contexts[j].tokens);
      if (similarity > 0) {
        graph.edges.push({ source: contexts[i].id, target: contexts[j].id, weight: similarity });
      }
    }
  }

  return graph;
}

/**
 * Applies a basic clustering algorithm (e.g., Louvain-like approximation).
 * @param {Object} graph - Graph representation (nodes and edges).
 * @returns {Array<Array<string>>} - Clusters of node IDs.
 */
export function clusterGraph(graph) {
  const clusters = [];
  const visited = new Set();

  function dfs(nodeId, cluster) {
    visited.add(nodeId);
    cluster.push(nodeId);

    for (const edge of graph.edges) {
      if (edge.source === nodeId && !visited.has(edge.target)) {
        dfs(edge.target, cluster);
      } else if (edge.target === nodeId && !visited.has(edge.source)) {
        dfs(edge.source, cluster);
      }
    }
  }

  for (const node of graph.nodes) {
    if (!visited.has(node.id)) {
      const cluster = [];
      dfs(node.id, cluster);
      clusters.push(cluster);
    }
  }

  return clusters;
}

/**
 * Compresses clusters into summary nodes.
 * @param {Array<Array<string>>} clusters - Clusters of node IDs.
 * @param {Object} graph - Original graph representation.
 * @returns {Array<{ id, summary}>} - Summary nodes.
 */
export function compressClusters(clusters, graph) {
  const summaries = [];

  for (const cluster of clusters) {
    const tokens = cluster.flatMap(nodeId => {
      const node = graph.nodes.find(n => n.id === nodeId);
      return node ? node.tokens : [];
    });

    const summary = Array.from(new Set(tokens)).join(' ');
    const summaryId = createHash('sha256').update(summary).digest('hex');

    summaries.push({ id: summaryId, summary });
  }

  return summaries;
}

/**
 * Main function to summarize large contexts using graph-based hierarchical summarization.
 * @param {Array<{ id, tokens }>} contexts - Array of contexts with unique IDs and token sequences.
 * @returns {Array<{ id, summary}>} - Summarized nodes.
 */
export function summarizeContexts(contexts) {
  const graph = constructSemanticGraph(contexts);
  const clusters = clusterGraph(graph);
  return compressClusters(clusters, graph);
}

/**
 * Example utility function to tokenize a text string into words.
 * @param {string} text - Input text.
 * @returns {string[]} - Array of tokens.
 */
export function tokenizeText(text) {
  return text.toLowerCase().match(/\w+/g) || [];
}