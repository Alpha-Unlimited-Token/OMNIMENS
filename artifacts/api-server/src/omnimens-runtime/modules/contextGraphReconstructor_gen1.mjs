/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_2
 * Name: contextGraphReconstructor
 * Purpose: Stores and reconstructs hierarchical context as a graph structure to preserve long-range dependencies.
 * Description: Stores and reconstructs hierarchical context as a graph structure, preserving long-range dependencies for multi-agent use.
 * Migrated: 2026-04-02T21:43:58.503Z
 */

// contextGraphReconstructor.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given string. Useful for node IDs.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash string.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Represents a node in the context graph.
 * @typedef {Object} ContextNode
 * @property {string} id - Unique identifier for the node.
 * @property {string} data - The context chunk stored in the node.
 * @property {Set<string>} edges - Set of connected node IDs.
 */

/**
 * Class representing the Context Graph.
 */
export class ContextGraph {
  constructor() {
    this.nodes = new Map(); // Map of node ID to ContextNode
  }

  /**
   * Adds a new node to the graph.
   * @param {string} data - The context chunk to store.
   * @returns {string} - The ID of the newly created node.
   */
  addNode(data) {
    const id = generateHash(data);
    if (!this.nodes.has(id)) {
      this.nodes.set(id, { id, data, edges: new Set() });
    }
    return id;
  }

  /**
   * Adds a directed edge between two nodes.
   * @param {string} fromId - ID of the source node.
   * @param {string} toId - ID of the target node.
   */
  addEdge(fromId, toId) {
    if (this.nodes.has(fromId) && this.nodes.has(toId)) {
      this.nodes.get(fromId).edges.add(toId);
    }
  }

  /**
   * Retrieves a node by its ID.
   * @param {string} id - The node ID.
   * @returns {ContextNode|null} - The node object or null if not found.
   */
  getNode(id) {
    return this.nodes.get(id) || null;
  }

  /**
   * Reconstructs the context hierarchy starting from a given node.
   * @param {string} startId - The ID of the starting node.
   * @param {Set<string>} [visited=new Set()] - Tracks visited nodes to prevent cycles.
   * @returns {Array<string>} - Ordered list of context chunks.
   */
  reconstructContext(startId, visited = new Set()) {
    if (!this.nodes.has(startId) || visited.has(startId)) {
      return [];
    }

    visited.add(startId);
    const node = this.nodes.get(startId);
    const context = [node.data];

    for (const neighborId of node.edges) {
      context.push(...this.reconstructContext(neighborId, visited));
    }

    return context;
  }

  /**
   * Returns the entire graph as a plain object for inspection or serialization.
   * @returns {Object} - The graph structure.
   */
  toObject() {
    const graph = {};
    for (const [id, node] of this.nodes) {
      graph[id] = { data: node.data, edges: Array.from(node.edges) };
    }
    return graph;
  }
}

/**
 * Utility function to create a new ContextGraph instance.
 * @returns {ContextGraph} - A new ContextGraph instance.
 */
export function createContextGraph() {
  return new ContextGraph();
}

/**
 * Example utility to demonstrate usage of ContextGraph.
 * @param {Array<{ data: string, edges: Array<number> }>} nodes - List of nodes with data and edges.
 * @returns {ContextGraph} - Populated ContextGraph.
 */
export function buildGraphFromData(nodes) {
  const graph = new ContextGraph();
  const idMap = new Map();

  // Add nodes first
  for (const { data } of nodes) {
    const id = graph.addNode(data);
    idMap.set(data, id);
  }

  // Add edges
  for (const { data, edges } of nodes) {
    const fromId = idMap.get(data);
    for (const edgeIndex of edges) {
      const toId = idMap.get(nodes[edgeIndex].data);
      graph.addEdge(fromId, toId);
    }
  }

  return graph;
}
