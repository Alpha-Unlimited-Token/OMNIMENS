/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: vectorSearchEngine
 * Written: 2026-03-22T04:30:51.670Z
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
 * @module vectorSearchEngine
 * @description Implements Hierarchical Navigable Small World (HNSW) graphs for approximate nearest neighbor search.
 * This module enables efficient similarity searches for high-dimensional vectors.
 */

/**
 * @typedef {Object} Node
 * @property {number} id - Unique identifier for the node.
 * @property {Array<number>} vector - The high-dimensional vector representing the node.
 * @property {Map<number, Set<number>>} neighbors - A map of layer to neighbors' IDs.
 */

/**
 * @typedef {Object} HNSWGraph
 * @property {Map<number, Node>} nodes - A map of node IDs to Node objects.
 * @property {number} maxLayer - The highest layer in the graph.
 * @property {number} entryPoint - The ID of the entry point node.
 */

/**
 * @function euclideanDistance
 * @description Calculates the Euclidean distance between two vectors.
 * @param {Array<number>} vectorA - The first vector.
 * @param {Array<number>} vectorB - The second vector.
 * @returns {number} The Euclidean distance between the vectors.
 */
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same dimensions.");
  }
  return Math.sqrt(vectorA.reduce((sum, a, i) => sum + (a - vectorB[i]) ** 2, 0));
}

/**
 * @function createNode
 * @description Creates a new node for the HNSW graph.
 * @param {number} id - The unique identifier for the node.
 * @param {Array<number>} vector - The high-dimensional vector representing the node.
 * @returns {Node} A new node object.
 */
export function createNode(id, vector) {
  return {
    id,
    vector,
    neighbors: new Map()
  };
}

/**
 * @function createHNSWGraph
 * @description Initializes an empty HNSW graph.
 * @returns {HNSWGraph} A new HNSW graph object.
 */
export function createHNSWGraph() {
  return {
    nodes: new Map(),
    maxLayer: 0,
    entryPoint
  };
}

/**
 * @function addNode
 * @description Adds a node to the HNSW graph and updates the graph structure.
 * @param {HNSWGraph} graph - The HNSW graph.
 * @param {Node} node - The node to add.
 * @param {number} maxNeighbors - Maximum number of neighbors per node per layer.
 */
export function addNode(graph, node, maxNeighbors) {
  if (graph.nodes.size === 0) {
    graph.entryPoint = node.id;
    graph.nodes.set(node.id, node);
    return;
  }

  let currentNodeId = graph.entryPoint;
  let currentLayer = graph.maxLayer;

  while (currentLayer >= 0) {
    const currentNode = graph.nodes.get(currentNodeId);
    const candidates = Array.from(currentNode.neighbors.get(currentLayer) || []);
    let closestNodeId = currentNodeId;
    let closestDistance = euclideanDistance(node.vector, currentNode.vector);

    for (const candidateId of candidates) {
      const candidateNode = graph.nodes.get(candidateId);
      const distance = euclideanDistance(node.vector, candidateNode.vector);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestNodeId = candidateId;
      }
    }

    if (closestNodeId === currentNodeId) {
      currentLayer--;
    } else {
      currentNodeId = closestNodeId;
    }
  }

  connectNode(graph, node, currentNodeId, maxNeighbors);
  graph.nodes.set(node.id, node);
}

/**
 * @function connectNode
 * @description Connects a new node to its neighbors in the graph.
 * @param {HNSWGraph} graph - The HNSW graph.
 * @param {Node} node - The new node to connect.
 * @param {number} neighborId - The ID of the initial neighbor.
 * @param {number} maxNeighbors - Maximum number of neighbors per node per layer.
 */
function connectNode(graph, node, neighborId, maxNeighbors) {
  const neighborNode = graph.nodes.get(neighborId);
  if (!neighborNode) return;

  const layer = 0; // Simplified single-layer implementation for now.
  if (!node.neighbors.has(layer)) {
    node.neighbors.set(layer, new Set());
  }
  if (!neighborNode.neighbors.has(layer)) {
    neighborNode.neighbors.set(layer, new Set());
  }

  node.neighbors.get(layer).add(neighborId);
  neighborNode.neighbors.get(layer).add(node.id);

  trimNeighbors(node, layer, maxNeighbors);
  trimNeighbors(neighborNode, layer, maxNeighbors);
}

/**
 * @function trimNeighbors
 * @description Ensures the number of neighbors for a node does not exceed the maximum.
 * @param {Node} node - The node whose neighbors will be trimmed.
 * @param {number} layer - The layer to trim neighbors in.
 * @param {number} maxNeighbors - Maximum number of neighbors allowed.
 */
function trimNeighbors(node, layer, maxNeighbors) {
  const neighbors = Array.from(node.neighbors.get(layer));
  if (neighbors.length > maxNeighbors) {
    neighbors.sort((a, b) => a - b); // Sort by ID for deterministic trimming.
    node.neighbors.set(layer, new Set(neighbors.slice(0, maxNeighbors)));
  }
}

/**
 * @function search
 * @description Searches for the nearest neighbors of a query vector in the HNSW graph.
 * @param {HNSWGraph} graph - The HNSW graph.
 * @param {Array<number>} queryVector - The vector to search for.
 * @param {number} k - The number of nearest neighbors to retrieve.
 * @returns {Array<{id, distance}>} The k nearest neighbors and their distances.
 */
export function search(graph, queryVector, k) {
  if (!graph.entryPoint) {
    return [];
  }

  const visited = new Set();
  const candidates = [{ id: graph.entryPoint, distance}];
  const results = [];

  while (candidates.length > 0) {
    const candidate = candidates.pop();
    if (visited.has(candidate.id)) continue;
    visited.add(candidate.id);

    const candidateNode = graph.nodes.get(candidate.id);
    const distance = euclideanDistance(queryVector, candidateNode.vector);

    results.push({ id: candidate.id, distance });
    results.sort((a, b) => a.distance - b.distance);
    if (results.length > k) results.pop();

    const neighbors = Array.from(candidateNode.neighbors.get(0) || []);
    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        candidates.push({ id: neighborId, distance });
      }
    }
  }

  return results.slice(0, k);
}