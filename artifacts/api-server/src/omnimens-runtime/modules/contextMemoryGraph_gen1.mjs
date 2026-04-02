/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_37
 * Name: contextMemoryGraph
 * Purpose: Preserves nuanced relationships across token windows using recursive dynamic memory graphs.
 * Description: A utility module for creating, managing, and merging dynamic memory graphs with semantic-weighted edges.
 * Migrated: 2026-04-02T15:11:36.904Z
 */

// contextMemoryGraph.mjs

import crypto from 'crypto';

/**
 * Generates a unique identifier for graph nodes.
 * @returns {string} A unique identifier string.
 */
export function generateUniqueId() {
  return crypto.randomUUID();
}

/**
 * Creates a weighted edge between two nodes.
 * @param {string} source - The source node ID.
 * @param {string} target - The target node ID.
 * @param {number} weight - The weight of the edge representing semantic importance.
 * @returns {object} An edge object.
 */
export function createEdge(source, target, weight) {
  if (weight < 0 || weight > 1) {
    throw new Error('Edge weight must be between 0 and 1.');
  }
  return { source, target, weight };
}

/**
 * Creates a graph node with a unique ID and associated data.
 * @param {object} data - The data associated with the node.
 * @returns {object} A node object.
 */
export function createNode(data) {
  return { id: generateUniqueId(), data };
}

/**
 * Initializes an empty graph.
 * @returns {object} An empty graph object.
 */
export function initializeGraph() {
  return { nodes: {}, edges: [] };
}

/**
 * Adds a node to the graph.
 * @param {object} graph - The graph object.
 * @param {object} node - The node to add.
 */
export function addNode(graph, node) {
  if (!graph.nodes[node.id]) {
    graph.nodes[node.id] = node;
  } else {
    throw new Error('Node with this ID already exists in the graph.');
  }
}

/**
 * Adds an edge to the graph.
 * @param {object} graph - The graph object.
 * @param {object} edge - The edge to add.
 */
export function addEdge(graph, edge) {
  if (!graph.nodes[edge.source] || !graph.nodes[edge.target]) {
    throw new Error('Both source and target nodes must exist in the graph.');
  }
  graph.edges.push(edge);
}

/**
 * Retrieves all neighbors of a given node.
 * @param {object} graph - The graph object.
 * @param {string} nodeId - The ID of the node.
 * @returns {Array} List of neighboring nodes.
 */
export function getNeighbors(graph, nodeId) {
  if (!graph.nodes[nodeId]) {
    throw new Error('Node does not exist in the graph.');
  }
  return graph.edges
    .filter(edge => edge.source === nodeId || edge.target === nodeId)
    .map(edge => edge.source === nodeId ? edge.target : edge.source);
}

/**
 * Calculates the semantic importance of a node based on its edges.
 * @param {object} graph - The graph object.
 * @param {string} nodeId - The ID of the node.
 * @returns {number} The calculated importance score.
 */
export function calculateNodeImportance(graph, nodeId) {
  if (!graph.nodes[nodeId]) {
    throw new Error('Node does not exist in the graph.');
  }
  return graph.edges
    .filter(edge => edge.source === nodeId || edge.target === nodeId)
    .reduce((sum, edge) => sum + edge.weight, 0);
}

/**
 * Recursively merges context graphs while preserving edge weights.
 * @param {object} graphA - The first graph.
 * @param {object} graphB - The second graph.
 * @returns {object} A new merged graph.
 */
export function mergeGraphs(graphA, graphB) {
  const mergedGraph = initializeGraph();

  // Add nodes from both graphs.
  Object.values(graphA.nodes).forEach(node => addNode(mergedGraph, node));
  Object.values(graphB.nodes).forEach(node => {
    if (!mergedGraph.nodes[node.id]) {
      addNode(mergedGraph, node);
    }
  });

  // Add edges from both graphs.
  [...graphA.edges, ...graphB.edges].forEach(edge => {
    const existingEdge = mergedGraph.edges.find(e => e.source === edge.source && e.target === edge.target);
    if (existingEdge) {
      existingEdge.weight = Math.max(existingEdge.weight, edge.weight); // Preserve the higher weight.
    } else {
      addEdge(mergedGraph, edge);
    }
  });

  return mergedGraph;
}

/**
 * Finds the shortest path between two nodes using Dijkstra's algorithm.
 * @param {object} graph - The graph object.
 * @param {string} startNodeId - The starting node ID.
 * @param {string} endNodeId - The ending node ID.
 * @returns {Array} The shortest path as a list of node IDs.
 */
export function findShortestPath(graph, startNodeId, endNodeId) {
  if (!graph.nodes[startNodeId] || !graph.nodes[endNodeId]) {
    throw new Error('Both start and end nodes must exist in the graph.');
  }

  const distances = {};
  const previousNodes = {};
  const unvisited = new Set(Object.keys(graph.nodes));

  // Initialize distances.
  Object.keys(graph.nodes).forEach(nodeId => {
    distances[nodeId] = Infinity;
  });
  distances[startNodeId] = 0;

  while (unvisited.size > 0) {
    const currentNodeId = [...unvisited].reduce((minNode, nodeId) => (
      distances[nodeId] < distances[minNode] ? nodeId : minNode
    ));

    if (currentNodeId === endNodeId) {
      break;
    }

    unvisited.delete(currentNodeId);

    const neighbors = getNeighbors(graph, currentNodeId);
    neighbors.forEach(neighborId => {
      const edge = graph.edges.find(e => (
        (e.source === currentNodeId && e.target === neighborId) ||
        (e.source === neighborId && e.target === currentNodeId)
      ));

      const newDistance = distances[currentNodeId] + (1 - edge.weight); // Higher weight = lower cost.
      if (newDistance < distances[neighborId]) {
        distances[neighborId] = newDistance;
        previousNodes[neighborId] = currentNodeId;
      }
    });
  }

  // Construct the path.
  const path = [];
  let currentNodeId = endNodeId;
  while (currentNodeId) {
    path.unshift(currentNodeId);
    currentNodeId = previousNodes[currentNodeId];
  }

  return path;
}
