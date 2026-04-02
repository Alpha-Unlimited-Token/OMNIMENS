/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_40
 * Name: losslessContextCompressor
 * Purpose: Preserves fine-grained dependencies in ultra-long contexts by encoding them as structured graphs.
 * Description: Encodes ultra-long contexts as hierarchical graphs for lossless compression and reconstruction.
 * Migrated: 2026-04-02T14:08:14.874Z
 */

// losslessContextCompressor.mjs

import { createHash } from 'crypto';

/**
 * Encodes a hierarchical tree structure into a graph representation.
 * Each node is hashed to ensure unique identification and efficient traversal.
 * @param {Object} tree - The input tree structure with nested children.
 * @returns {Object} - A graph representation of the tree.
 */
export function encodeTreeToGraph(tree) {
  const graph = new Map();

  function traverse(node, parentHash = null) {
    const nodeHash = createHash('sha256').update(JSON.stringify(node)).digest('hex');
    if (!graph.has(nodeHash)) {
      graph.set(nodeHash, { data: node.data, children: [], parent: parentHash });
    }
    if (parentHash) {
      graph.get(parentHash).children.push(nodeHash);
    }
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        traverse(child, nodeHash);
      }
    }
  }

  traverse(tree);
  return Object.fromEntries(graph);
}

/**
 * Reconstructs the original tree structure from a graph representation.
 * @param {Object} graph - The graph representation of the tree.
 * @param {string} rootHash - The hash of the root node.
 * @returns {Object} - The reconstructed tree structure.
 */
export function decodeGraphToTree(graph, rootHash) {
  function reconstruct(nodeHash) {
    const node = graph[nodeHash];
    if (!node) {
      throw new Error(`Node with hash ${nodeHash} not found in the graph.`);
    }
    return {
      data: node.data,
      children: node.children.map(reconstruct)
    };
  }

  return reconstruct(rootHash);
}

/**
 * Utility function to find the root node hash in a graph.
 * A root node is identified as having no parent.
 * @param {Object} graph - The graph representation of the tree.
 * @returns {string} - The hash of the root node.
 */
export function findRootHash(graph) {
  for (const [hash, node] of Object.entries(graph)) {
    if (!node.parent) {
      return hash;
    }
  }
  throw new Error('Root node not found in the graph.');
}

/**
 * Example utility to compress and decompress a tree structure.
 * @param {Object} tree - The input tree structure.
 * @returns {Object} - An object containing the graph and reconstructed tree.
 */
export function compressAndDecompressTree(tree) {
  const graph = encodeTreeToGraph(tree);
  const rootHash = findRootHash(graph);
  const reconstructedTree = decodeGraphToTree(graph, rootHash);
  return { graph, reconstructedTree };
}

// Example tree structure for testing
const exampleTree = {
  data: 'root',
  children: [
    { data: 'child1', children: [{ data: 'grandchild1', children: [] }] },
    { data: 'child2', children: [] }
  ]
};

// Example usage
const { graph, reconstructedTree } = compressAndDecompressTree(exampleTree);
console.log({ graph, reconstructedTree });