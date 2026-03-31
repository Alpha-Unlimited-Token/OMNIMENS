/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: graphContextSummarizer
 * Purpose: Preserve semantic relationships across large contexts using graph-based hierarchical summarization.
 * Description: Graph-based hierarchical summarization module for preserving semantic relationships across large contexts.
 * Migrated: 2026-03-25T22:49:34.141Z
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
 * @param {Array<{ id: string, tokens: string[] }>} contexts - Array of contexts with unique IDs and token sequences.
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
 * @returns {Array<{ id: string, summary: string }>} - Summary nodes.
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
 * @param {Array<{ id: string, tokens: string[] }>} contexts - Array of contexts with unique IDs and token sequences.
 * @returns {Array<{ id: string, summary: string }>} - Summarized nodes.
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