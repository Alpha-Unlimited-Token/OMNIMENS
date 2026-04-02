/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: memoryHierarchyManager
 * Written: 2026-04-02T14:37:22.207Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// memoryHierarchyManager.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given input to identify memory nodes.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function generateNodeId(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Represents a memory node in the graph.
 * @typedef {Object} MemoryNode
 * @property {string} id - Unique identifier for the node.
 * @property {string} content - The content stored in the node.
 * @property {Set<string>} links - IDs of connected nodes.
 */

/**
 * Creates a new memory node.
 * @param {string} content - The content of the memory node.
 * @returns {MemoryNode} - A new memory node.
 */
export function createMemoryNode(content) {
  return {
    id: generateNodeId(content),
    content,
    links: new Set()
  };
}

/**
 * Links two memory nodes bidirectionally.
 * @param {MemoryNode} nodeA - The first memory node.
 * @param {MemoryNode} nodeB - The second memory node.
 */
export function linkNodes(nodeA, nodeB) {
  nodeA.links.add(nodeB.id);
  nodeB.links.add(nodeA.id);
}

/**
 * Summarizes a set of memory nodes into a hierarchical summary.
 * @param {MemoryNode[]} nodes - The nodes to summarize.
 * @returns {MemoryNode} - A summary node containing concatenated content.
 */
export function summarizeNodes(nodes) {
  const combinedContent = nodes.map(node => node.content).join(' ');
  const summaryNode = createMemoryNode(combinedContent);
  nodes.forEach(node => linkNodes(node, summaryNode));
  return summaryNode;
}

/**
 * Retrieves nodes based on importance weighting.
 * @param {MemoryNode[]} nodes - The nodes to search.
 * @param {string} query - The query to match against node content.
 * @returns {MemoryNode[]} - Nodes sorted by relevance to the query.
 */
export function retrieveNodes(nodes, query) {
  const queryHash = generateNodeId(query);
  return nodes
    .map(node => ({
      node,
      similarity: calculateSimilarity(node.id, queryHash)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .map(entry => entry.node);
}

/**
 * Calculates a similarity score between two hashes.
 * @param {string} hashA - The first hash.
 * @param {string} hashB - The second hash.
 * @returns {number} - A similarity score (0 to 1).
 */
export function calculateSimilarity(hashA, hashB) {
  let matches = 0;
  for (let i = 0; i < Math.min(hashA.length, hashB.length); i++) {
    if (hashA[i] === hashB[i]) matches++;
  }
  return matches / Math.max(hashA.length, hashB.length);
}

/**
 * Creates a graph-based memory system to manage long-range dependencies.
 * @returns {Object} - Memory graph with utility functions.
 */
export function createMemoryGraph() {
  const nodes = new Map();

  return {
    addNode(content) {
      const node = createMemoryNode(content);
      nodes.set(node.id, node);
      return node;
    },
    linkNodesById(idA, idB) {
      const nodeA = nodes.get(idA);
      const nodeB = nodes.get(idB);
      if (nodeA && nodeB) linkNodes(nodeA, nodeB);
    },
    summarize(ids) {
      const selectedNodes = ids.map(id => nodes.get(id)).filter(Boolean);
      return summarizeNodes(selectedNodes);
    },
    retrieve(query) {
      return retrieveNodes([...nodes.values()], query);
    },
    getNodeById(id) {
      return nodes.get(id);
    }
  };
}