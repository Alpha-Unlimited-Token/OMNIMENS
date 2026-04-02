/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_48
 * Name: semanticMemoryGraph
 * Purpose: Creates a graph-based memory system to link compressed summaries to raw data for context restoration.
 * Description: Creates a graph-based memory system linking compressed summaries to raw data for context restoration and semantic querying.
 * Migrated: 2026-04-02T14:50:29.440Z
 */

// semanticMemoryGraph.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given input string.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash representing the input.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Represents a graph-based memory system.
 */
const memoryGraph = {
  nodes: new Map(), // Stores nodes with their unique IDs
  edges: new Map()  // Stores edges with relationships between nodes
};

/**
 * Adds a new concept node to the graph.
 * @param {string} concept - The concept to add.
 * @param {string} summary - A compressed summary of the concept.
 * @returns {string} - The unique ID of the added node.
 */
export function addNode(concept, summary) {
  const nodeId = generateHash(concept);
  if (!memoryGraph.nodes.has(nodeId)) {
    memoryGraph.nodes.set(nodeId, { concept, summary });
  }
  return nodeId;
}

/**
 * Adds a semantic relationship (edge) between two nodes.
 * @param {string} nodeId1 - The ID of the first node.
 * @param {string} nodeId2 - The ID of the second node.
 * @param {string} relationship - The semantic relationship between the nodes.
 */
export function addEdge(nodeId1, nodeId2, relationship) {
  if (!memoryGraph.nodes.has(nodeId1) || !memoryGraph.nodes.has(nodeId2)) {
    throw new Error('One or both node IDs do not exist in the graph.');
  }
  const edgeKey = `${nodeId1}-${nodeId2}`;
  memoryGraph.edges.set(edgeKey, { nodeId1, nodeId2, relationship });
}

/**
 * Retrieves the context of a concept by reconstructing its relationships.
 * @param {string} nodeId - The ID of the node to reconstruct context for.
 * @returns {object} - The concept, summary, and related nodes.
 */
export function getContext(nodeId) {
  if (!memoryGraph.nodes.has(nodeId)) {
    throw new Error('Node ID does not exist in the graph.');
  }

  const node = memoryGraph.nodes.get(nodeId);
  const relatedNodes = [];

  for (const [key, edge] of memoryGraph.edges.entries()) {
    if (edge.nodeId1 === nodeId || edge.nodeId2 === nodeId) {
      const relatedNodeId = edge.nodeId1 === nodeId ? edge.nodeId2 : edge.nodeId1;
      relatedNodes.push({
        relationship: edge.relationship,
        node: memoryGraph.nodes.get(relatedNodeId)
      });
    }
  }

  return {
    concept: node.concept,
    summary: node.summary,
    relatedNodes
  };
}

/**
 * Queries the graph for nodes matching a specific concept.
 * @param {string} concept - The concept to search for.
 * @returns {Array<object>} - List of matching nodes.
 */
export function queryNodes(concept) {
  const matches = [];
  for (const [nodeId, node] of memoryGraph.nodes.entries()) {
    if (node.concept.includes(concept)) {
      matches.push({ nodeId, ...node });
    }
  }
  return matches;
}

/**
 * Clears the entire graph, resetting nodes and edges.
 */
export function clearGraph() {
  memoryGraph.nodes.clear();
  memoryGraph.edges.clear();
}

export const graphUtilities = {
  addNode,
  addEdge,
  getContext,
  queryNodes,
  clearGraph
};