/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticGraphCompressor
 * Written: 2026-04-01T22:04:51.249Z
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
 * Generate a semantic graph from a document by extracting entities, relations, and key concepts.
 * @param {string} text - The input document text.
 * @returns {Object} - A semantic graph represented as an adjacency list.
 */
export function generateSemanticGraph(text) {
  const sentences = text.split(/(?<=[.!?])\s+/); // Split text into sentences.
  const graph = {};

  sentences.forEach((sentence, index) => {
    const words = sentence.match(/\b\w+\b/g) || [];
    words.forEach((word) => {
      const normalizedWord = word.toLowerCase();
      if (!graph[normalizedWord]) graph[normalizedWord] = new Set();

      words.forEach((relatedWord) => {
        const normalizedRelatedWord = relatedWord.toLowerCase();
        if (normalizedWord !== normalizedRelatedWord) {
          graph[normalizedWord].add(normalizedRelatedWord);
        }
      });
    });
  });

  // Convert sets to arrays for easier processing.
  for (const key in graph) {
    graph[key] = Array.from(graph[key]);
  }

  return graph;
}

/**
 * Cluster nodes in the semantic graph to identify key concepts.
 * @param {Object} graph - The semantic graph (adjacency list).
 * @returns {Array} - An array of clusters, each represented as an array of nodes.
 */
export function clusterSemanticGraph(graph) {
  const visited = new Set();
  const clusters = [];

  function dfs(node, cluster) {
    if (visited.has(node)) return;
    visited.add(node);
    cluster.push(node);

    (graph[node] || []).forEach((neighbor) => {
      dfs(neighbor, cluster);
    });
  }

  for (const node in graph) {
    if (!visited.has(node)) {
      const cluster = [];
      dfs(node, cluster);
      clusters.push(cluster);
    }
  }

  return clusters;
}

/**
 * Compress the document by retaining key sentences that preserve semantic relationships.
 * @param {string} text - The input document text.
 * @param {number} maxSentences - Maximum number of sentences to retain.
 * @returns {string} - The compressed document.
 */
export function compressDocument(text, maxSentences) {
  const graph = generateSemanticGraph(text);
  const clusters = clusterSemanticGraph(graph);

  const sentenceScores = new Map();
  const sentences = text.split(/(?<=[.!?])\s+/);

  sentences.forEach((sentence, index) => {
    const words = sentence.match(/\b\w+\b/g) || [];
    let score = 0;

    words.forEach((word) => {
      const normalizedWord = word.toLowerCase();
      score += (graph[normalizedWord]?.length || 0);
    });

    sentenceScores.set(index, score);
  });

  const sortedSentences = Array.from(sentenceScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxSentences)
    .map(([index]) => sentences[index]);

  return sortedSentences.join(' ');
}

/**
 * Generate a hash of the semantic graph for verification or caching purposes.
 * @param {Object} graph - The semantic graph (adjacency list).
 * @returns {string} - A hash string representing the graph.
 */
export function hashSemanticGraph(graph) {
  const sortedGraph = Object.keys(graph)
    .sort()
    .reduce((acc, key) => {
      acc[key] = graph[key].sort();
      return acc;
    }, {});

  const graphString = JSON.stringify(sortedGraph);
  return createHash('sha256').update(graphString).digest('hex');
}

/**
 * Utility function to extract key concepts from a document.
 * @param {string} text - The input document text.
 * @returns {Array} - An array of key concepts (nodes with highest connectivity).
 */
export function extractKeyConcepts(text) {
  const graph = generateSemanticGraph(text);
  const conceptScores = Object.entries(graph).map(([node, neighbors]) => ({
    node,
    score: neighbors.length
  }));

  conceptScores.sort((a, b) => b.score - a.score);
  return conceptScores.slice(0, 10).map((concept) => concept.node); // Top 10 key concepts.
}
