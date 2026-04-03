/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: graphMemoryManager
 * Written: 2026-04-03T09:11:31.714Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * TRANSLATION STATUS:
 * Novel constructs: attention
 * All constructs have translation mappings
 * Compiled targets: javascript: OK (4 IR steps) | python: OK (4 IR steps) | c: OK (4 IR steps) | x86_64: OK (4 IR steps) | arm64: OK (4 IR steps) | avr: OK (4 IR steps)
 * Translation map version: 22
 */
// graphMemoryManager.mjs

import { createHash } from 'crypto';

// Utility to hash semantic units for node identification
export function hashSemanticUnit(data) {
  const hash = createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
}

// Graph structure to manage nodes and edges
export const graphMemoryManager = {
  nodes: new Map(), // Map of nodeId -> { data, edges }

  // Add a node to the graph
  addNode(data) {
    const nodeId = hashSemanticUnit(data);
    if (!this.nodes.has(nodeId)) {
      this.nodes.set(nodeId, { data, edges: new Map() });
    }
    return nodeId;
  },

  // Add or update an edge between two nodes with a weight
  addEdge(nodeId1, nodeId2, weight = 1) {
    if (!this.nodes.has(nodeId1) || !this.nodes.has(nodeId2)) {
      throw new Error('Both nodes must exist in the graph');
    }
    const node1 = this.nodes.get(nodeId1);
    const node2 = this.nodes.get(nodeId2);

    // Update edge weights dynamically
    node1.edges.set(nodeId2, (node1.edges.get(nodeId2) || 0) + weight);
    node2.edges.set(nodeId1, (node2.edges.get(nodeId1) || 0) + weight);
  },

  // Retrieve contextually related nodes using attention-like scoring
  getContextualNodes(nodeId, threshold = 0.1) {
    if (!this.nodes.has(nodeId)) {
      throw new Error('Node does not exist in the graph');
    }
    const edges = this.nodes.get(nodeId).edges;
    return Array.from(edges.entries())
      .filter(([_, weight]) => weight >= threshold)
      .map(([relatedNodeId]) => ({
        nodeId: relatedNodeId,
        data: this.nodes.get(relatedNodeId).data,
        weight: edges.get(relatedNodeId)
      }));
  },

  // Remove nodes and their associated edges
  removeNode(nodeId) {
    if (!this.nodes.has(nodeId)) {
      throw new Error('Node does not exist in the graph');
    }
    this.nodes.delete(nodeId);
    for (const node of this.nodes.values()) {
      node.edges.delete(nodeId);
    }
  },

  // Serialize the graph to JSON for storage or transfer
  serialize() {
    return JSON.stringify(
      Array.from(this.nodes.entries()).map(([nodeId, { data, edges }]) => ({
        nodeId,
        data,
        edges: Array.from(edges.entries())
      }))
    );
  },

  // Deserialize JSON to reconstruct the graph
  deserialize(json) {
    const parsed = JSON.parse(json);
    this.nodes.clear();
    for (const { nodeId, data, edges } of parsed) {
      this.nodes.set(nodeId, {
        data,
        edges: new Map(edges)
      });
    }
  }
};

// Example utility: Compute shortest path using Dijkstra's algorithm
export function shortestPath(graph, startNodeId, endNodeId) {
  if (!graph.nodes.has(startNodeId) || !graph.nodes.has(endNodeId)) {
    throw new Error('Both start and end nodes must exist in the graph');
  }

  const distances = new Map();
  const previous = new Map();
  const unvisited = new Set(graph.nodes.keys());

  graph.nodes.forEach((_, nodeId) => {
    distances.set(nodeId, Infinity);
  });
  distances.set(startNodeId, 0);

  while (unvisited.size > 0) {
    const currentNodeId = Array.from(unvisited).reduce((closestNode, nodeId) => {
      return distances.get(nodeId) < distances.get(closestNode) ? nodeId : closestNode;
    });

    if (currentNodeId === endNodeId) break;

    unvisited.delete(currentNodeId);

    const currentNode = graph.nodes.get(currentNodeId);
    for (const [neighborId, weight] of currentNode.edges) {
      if (!unvisited.has(neighborId)) continue;
      const alt = distances.get(currentNodeId) + weight;
      if (alt < distances.get(neighborId)) {
        distances.set(neighborId, alt);
        previous.set(neighborId, currentNodeId);
      }
    }
  }

  const path = [];
  let currentNodeId = endNodeId;
  while (currentNodeId) {
    path.unshift(currentNodeId);
    currentNodeId = previous.get(currentNodeId);
  }

  return path.length > 1 ? path : null;
}