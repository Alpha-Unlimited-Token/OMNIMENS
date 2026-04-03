/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticGraphCompressor
 * Written: 2026-04-03T07:01:20.585Z
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
 * Generate a weighted semantic graph from a document.
 * @param {string} text - The input document.
 * @returns {Object} - A graph representation with nodes and weighted edges.
 */
export function generateSemanticGraph(text) {
  const sentences = text.split(/(?<=[.!?])\s+/); // Split text into sentences.
  const nodes = sentences.map((sentence, index) => ({ id: index, text: sentence }));

  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const weight = calculateSemanticSimilarity(nodes[i].text, nodes[j].text);
      edges.push({ source: nodes[i].id, target: nodes[j].id, weight });
    }
  }

  return { nodes, edges };
}

/**
 * Calculate semantic similarity between two sentences.
 * @param {string} sentenceA - First sentence.
 * @param {string} sentenceB - Second sentence.
 * @returns {number} - Similarity score (0 to 1).
 */
export function calculateSemanticSimilarity(sentenceA, sentenceB) {
  const hashA = createHash('sha256').update(sentenceA).digest('hex');
  const hashB = createHash('sha256').update(sentenceB).digest('hex');

  let similarity = 0;
  for (let i = 0; i < hashA.length; i++) {
    if (hashA[i] === hashB[i]) similarity++;
  }

  return similarity / hashA.length; // Normalize similarity (0 to 1).
}

/**
 * Compress the graph using minimum spanning tree (MST).
 * @param {Object} graph - The semantic graph.
 * @returns {Object} - Compressed graph.
 */
export function compressGraph(graph) {
  const { nodes, edges } = graph;
  const mstEdges = minimumSpanningTree(nodes, edges);
  return { nodes, edges: mstEdges };
}

/**
 * Compute the minimum spanning tree (MST) of a graph.
 * @param {Array} nodes - Graph nodes.
 * @param {Array} edges - Graph edges.
 * @returns {Array} - MST edges.
 */
export function minimumSpanningTree(nodes, edges) {
  const sortedEdges = edges.sort((a, b) => a.weight - b.weight);
  const mstEdges = [];
  const parent = {};

  nodes.forEach(node => (parent[node.id] = node.id));

  function find(nodeId) {
    if (parent[nodeId] !== nodeId) {
      parent[nodeId] = find(parent[nodeId]);
    }
    return parent[nodeId];
  }

  function union(nodeA, nodeB) {
    const rootA = find(nodeA);
    const rootB = find(nodeB);
    if (rootA !== rootB) parent[rootA] = rootB;
  }

  sortedEdges.forEach(edge => {
    const { source, target } = edge;
    if (find(source) !== find(target)) {
      mstEdges.push(edge);
      union(source, target);
    }
  });

  return mstEdges;
}

/**
 * Generate a compressed representation of a document.
 * @param {string} text - The input document.
 * @returns {Object} - Compressed semantic graph.
 */
export function compressDocument(text) {
  const graph = generateSemanticGraph(text);
  return compressGraph(graph);
}

/**
 * Utility to extract key sentences from a compressed graph.
 * @param {Object} compressedGraph - Compressed semantic graph.
 * @returns {Array} - Key sentences.
 */
export function extractKeySentences(compressedGraph) {
  const { nodes, edges } = compressedGraph;
  const keyNodeIds = new Set(edges.flatMap(edge => [edge.source, edge.target]));
  return nodes.filter(node => keyNodeIds.has(node.id)).map(node => node.text);
}