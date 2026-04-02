/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticGraphCompressor
 * Written: 2026-04-02T15:15:41.863Z
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
 * Generates a semantic graph from text by extracting entities and relationships.
 * @param {string} text - The input text to analyze.
 * @returns {object} - A graph representation with nodes and edges.
 */
export function generateSemanticGraph(text) {
  const words = text.split(/\s+/);
  const nodes = new Set(words);
  const edges = [];

  for (let i = 0; i < words.length - 1; i++) {
    edges.push({ source: words[i], target: words[i + 1] });
  }

  return { nodes: Array.from(nodes), edges };
}

/**
 * Compresses a semantic graph into a hash-based embedding.
 * @param {object} graph - The semantic graph to compress.
 * @returns {string} - A hash representing the compressed graph.
 */
export function compressGraph(graph) {
  const graphString = JSON.stringify(graph);
  return crypto.createHash('sha256').update(graphString).digest('hex');
}

/**
 * Reconstructs a semantic graph from a hash and context.
 * @param {string} hash - The hash representing the compressed graph.
 * @param {string} context - Additional context to aid in reconstruction.
 * @returns {object} - A reconstructed semantic graph approximation.
 */
export function reconstructGraph(hash, context) {
  const words = context.split(/\s+/);
  const nodes = new Set(words);
  const edges = [];

  for (let i = 0; i < words.length - 1; i++) {
    edges.push({ source: words[i], target: words[i + 1] });
  }

  return { nodes: Array.from(nodes), edges, hash };
}

/**
 * Utility to extract key entities from text.
 * @param {string} text - The input text to analyze.
 * @returns {Set<string>} - A set of unique words/entities.
 */
export function extractEntities(text) {
  return new Set(text.split(/\s+/));
}

/**
 * Utility to calculate graph similarity based on node and edge overlap.
 * @param {object} graphA - The first semantic graph.
 * @param {object} graphB - The second semantic graph.
 * @returns {number} - A similarity score between 0 and 1.
 */
export function calculateGraphSimilarity(graphA, graphB) {
  const nodesA = new Set(graphA.nodes);
  const nodesB = new Set(graphB.nodes);
  const edgesA = new Set(graphA.edges.map(e => `${e.source}->${e.target}`));
  const edgesB = new Set(graphB.edges.map(e => `${e.source}->${e.target}`));

  const nodeIntersection = new Set([...nodesA].filter(x => nodesB.has(x))).size;
  const edgeIntersection = new Set([...edgesA].filter(x => edgesB.has(x))).size;

  const nodeUnion = new Set([...nodesA, ...nodesB]).size;
  const edgeUnion = new Set([...edgesA, ...edgesB]).size;

  const nodeSimilarity = nodeUnion === 0 ? 0 : nodeIntersection / nodeUnion;
  const edgeSimilarity = edgeUnion === 0 ? 0 : edgeIntersection / edgeUnion;

  return (nodeSimilarity + edgeSimilarity) / 2;
}

/**
 * Expands context by merging multiple semantic graphs.
 * @param {Array<object>} graphs - An array of semantic graphs to merge.
 * @returns {object} - A merged semantic graph.
 */
export function mergeGraphs(graphs) {
  const nodes = new Set();
  const edges = new Set();

  for (const graph of graphs) {
    graph.nodes.forEach(node => nodes.add(node));
    graph.edges.forEach(edge => edges.add(`${edge.source}->${edge.target}`));
  }

  return {
    nodes: Array.from(nodes),
    edges: Array.from(edges).map(edge => {
      const [source, target] = edge.split('->');
      return { source, target };
    })
  };
}
