/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_21
 * Name: semanticGraphSummarizer
 * Purpose: Preserves contextual relationships in compressed token windows using graph-based summarization.
 * Description: Builds and compresses semantic graphs from text data, preserving contextual relationships for summarization and analysis.
 * Migrated: 2026-04-02T14:21:19.472Z
 */

// semanticGraphSummarizer.mjs

import { createHash } from 'crypto';

/**
 * Generate a semantic graph from input data.
 * @param {string[]} inputData - Array of text strings to process.
 * @returns {Map<string, Set<string>>} - A graph represented as an adjacency list.
 */
export function buildSemanticGraph(inputData) {
  const graph = new Map();

  inputData.forEach((text, index) => {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueWords = new Set(words);

    uniqueWords.forEach((word) => {
      if (!graph.has(word)) {
        graph.set(word, new Set());
      }
      uniqueWords.forEach((relatedWord) => {
        if (word !== relatedWord) {
          graph.get(word).add(relatedWord);
        }
      });
    });
  });

  return graph;
}

/**
 * Apply hierarchical clustering to reduce the graph size.
 * @param {Map<string, Set<string>>} graph - The semantic graph to compress.
 * @param {number} maxNodes - Maximum number of nodes to retain.
 * @returns {Map<string, Set<string>>} - Compressed semantic graph.
 */
export function compressSemanticGraph(graph, maxNodes) {
  if (graph.size <= maxNodes) return graph;

  const nodeScores = new Map();

  graph.forEach((edges, node) => {
    nodeScores.set(node, edges.size);
  });

  const sortedNodes = Array.from(nodeScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxNodes)
    .map(([node]) => node);

  const compressedGraph = new Map();

  sortedNodes.forEach((node) => {
    const filteredEdges = new Set(
      Array.from(graph.get(node) || []).filter((edge) => sortedNodes.includes(edge))
    );
    compressedGraph.set(node, filteredEdges);
  });

  return compressedGraph;
}

/**
 * Generate a unique hash for a semantic graph.
 * @param {Map<string, Set<string>>} graph - The graph to hash.
 * @returns {string} - A SHA-256 hash representing the graph structure.
 */
export function hashSemanticGraph(graph) {
  const sortedEntries = Array.from(graph.entries())
    .map(([node, edges]) => `${node}:${Array.from(edges).sort().join(',')}`)
    .sort()
    .join('|');

  return createHash('sha256').update(sortedEntries).digest('hex');
}

/**
 * Summarize input data by building and compressing a semantic graph.
 * @param {string[]} inputData - Array of text strings to summarize.
 * @param {number} maxNodes - Maximum number of nodes to retain in the summary.
 * @returns {object} - Summary containing the compressed graph and its hash.
 */
export function summarizeSemanticGraph(inputData, maxNodes) {
  const graph = buildSemanticGraph(inputData);
  const compressedGraph = compressSemanticGraph(graph, maxNodes);
  const graphHash = hashSemanticGraph(compressedGraph);

  return {
    compressedGraph,
    graphHash
  };
}

/**
 * Utility function to extract unique words from a text.
 * @param {string} text - Input text.
 * @returns {Set<string>} - Set of unique words.
 */
export function extractUniqueWords(text) {
  return new Set((text.toLowerCase().match(/\b\w+\b/g) || []));
}