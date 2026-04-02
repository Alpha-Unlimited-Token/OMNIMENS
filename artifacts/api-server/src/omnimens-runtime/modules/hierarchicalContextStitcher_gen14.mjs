/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalContextStitcher
 * Written: 2026-04-02T14:53:25.433Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchicalContextStitcher.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given string. Useful for node identification in graphs.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash string.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Compresses a text block into a summary using a simple heuristic (e.g., truncation or keyword extraction).
 * @param {string} text - The text to summarize.
 * @param {number} maxLength - The maximum length of the summary.
 * @returns {string} - A compressed summary of the text.
 */
export function compressText(text, maxLength = 200) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Represents a graph-based structure for linking summaries.
 * Nodes are summaries, and edges represent semantic relationships.
 */
export class SummaryGraph {
  constructor() {
    this.nodes = new Map(); // Map of nodeId -> { summary, edges: Set<nodeId> }
  }

  /**
   * Adds a node to the graph.
   * @param {string} summary - The summary text of the node.
   * @returns {string} - The unique ID of the created node.
   */
  addNode(summary) {
    const nodeId = generateHash(summary);
    if (!this.nodes.has(nodeId)) {
      this.nodes.set(nodeId, { summary, edges: new Set() });
    }
    return nodeId;
  }

  /**
   * Adds a bidirectional edge between two nodes.
   * @param {string} nodeId1 - The ID of the first node.
   * @param {string} nodeId2 - The ID of the second node.
   */
  addEdge(nodeId1, nodeId2) {
    if (this.nodes.has(nodeId1) && this.nodes.has(nodeId2)) {
      this.nodes.get(nodeId1).edges.add(nodeId2);
      this.nodes.get(nodeId2).edges.add(nodeId1);
    }
  }

  /**
   * Retrieves a node's summary and its connected neighbors.
   * @param {string} nodeId - The ID of the node.
   * @returns {Object|null} - The node data or null if not found.
   */
  getNode(nodeId) {
    return this.nodes.get(nodeId) || null;
  }

  /**
   * Traverses the graph starting from a given node.
   * @param {string} startNodeId - The ID of the starting node.
   * @param {number} maxDepth - The maximum depth to traverse.
   * @returns {Array} - An array of visited nodes in traversal order.
   */
  traverse(startNodeId, maxDepth = 3) {
    if (!this.nodes.has(startNodeId)) return [];

    const visited = new Set();
    const result = [];
    const queue = [{ nodeId: startNodeId, depth: 0 }];

    while (queue.length > 0) {
      const { nodeId, depth } = queue.shift();

      if (visited.has(nodeId) || depth > maxDepth) continue;
      visited.add(nodeId);
      result.push(this.nodes.get(nodeId));

      for (const neighbor of this.nodes.get(nodeId).edges) {
        if (!visited.has(neighbor)) {
          queue.push({ nodeId: neighbor, depth: depth + 1 });
        }
      }
    }

    return result;
  }
}

/**
 * Processes an ultra-large document by splitting it into chunks, summarizing each chunk,
 * and linking the summaries in a graph structure.
 * @param {string} document - The ultra-large document to process.
 * @param {number} chunkSize - The size of each chunk in characters.
 * @returns {SummaryGraph} - The constructed summary graph.
 */
export function processDocument(document, chunkSize = 1000) {
  const graph = new SummaryGraph();
  const chunks = [];

  for (let i = 0; i < document.length; i += chunkSize) {
    chunks.push(document.slice(i, i + chunkSize));
  }

  let previousNodeId = null;

  for (const chunk of chunks) {
    const summary = compressText(chunk);
    const nodeId = graph.addNode(summary);

    if (previousNodeId) {
      graph.addEdge(previousNodeId, nodeId);
    }

    previousNodeId = nodeId;
  }

  return graph;
}

/**
 * Reconstructs a document by traversing the graph and concatenating summaries.
 * @param {SummaryGraph} graph - The summary graph.
 * @param {string} startNodeId - The starting node ID for reconstruction.
 * @returns {string} - The reconstructed document.
 */
export function reconstructDocument(graph, startNodeId) {
  const nodes = graph.traverse(startNodeId);
  return nodes.map(node => node.summary).join(' ');
}
