/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: embeddingIndexManager
 * Written: 2026-04-02T15:03:44.013Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// embeddingIndexManager.mjs

import { createHash } from 'crypto';

// Utility function to calculate Euclidean distance between two vectors
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  return Math.sqrt(vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0));
}

// Utility function to hash vectors for unique identification
export function hashVector(vector) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(vector));
  return hash.digest('hex');
}

// Class representing the HNSW graph
class HNSWGraph {
  constructor(maxNodes = 1000, maxEdges = 10) {
    this.maxNodes = maxNodes;
    this.maxEdges = maxEdges;
    this.nodes = new Map(); // Map of nodeId -> { vector, edges }
  }

  // Add a new vector to the graph
  addVector(vector) {
    const nodeId = hashVector(vector);
    if (this.nodes.has(nodeId)) {
      return; // Avoid duplicate nodes
    }

    const newNode = { vector, edges: [] };

    // Connect to nearest neighbors
    const neighbors = this.findNearestNeighbors(vector, this.maxEdges);
    neighbors.forEach((neighbor) => {
      newNode.edges.push(neighbor.nodeId);
      neighbor.edges.push(nodeId);
    });

    this.nodes.set(nodeId, newNode);

    // Ensure graph doesn't exceed maxNodes
    if (this.nodes.size > this.maxNodes) {
      this.pruneGraph();
    }
  }

  // Find nearest neighbors for a given vector
  findNearestNeighbors(vector, k = 1) {
    const distances = [];

    for (const [nodeId, node] of this.nodes) {
      const distance = euclideanDistance(vector, node.vector);
      distances.push({ nodeId, node, distance });
    }

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, k).map((entry) => entry.node);
  }

  // Prune the graph to maintain maxNodes constraint
  pruneGraph() {
    const allNodes = Array.from(this.nodes.values());
    allNodes.sort((a, b) => b.edges.length - a.edges.length); // Keep most connected nodes

    while (this.nodes.size > this.maxNodes) {
      const nodeToRemove = allNodes.pop();
      this.nodes.delete(hashVector(nodeToRemove.vector));

      // Remove edges pointing to the removed node
      for (const node of this.nodes.values()) {
        node.edges = node.edges.filter((edge) => edge !== hashVector(nodeToRemove.vector));
      }
    }
  }
}

// Exported function to create a new HNSW graph instance
export function createHNSWGraph(maxNodes = 1000, maxEdges = 10) {
  return new HNSWGraph(maxNodes, maxEdges);
}

// Exported function to perform similarity search
export function similaritySearch(graph, queryVector, k = 1) {
  return graph.findNearestNeighbors(queryVector, k);
}

// Exported function to add a vector to the graph
export function addVectorToGraph(graph, vector) {
  graph.addVector(vector);
}

// Exported function to prune an existing graph
export function pruneGraph(graph) {
  graph.pruneGraph();
}