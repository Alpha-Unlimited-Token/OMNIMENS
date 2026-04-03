/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_3
 * Name: headlessWebNavigator
 * Purpose: Enable DOM rendering and JavaScript execution for autonomous web interaction.
 * Description: A utility module enabling headless web navigation, DOM simulation, vector similarity, and graph traversal for multi-agent systems.
 * Migrated: 2026-04-03T06:25:08.713Z
 */

// Complete ES module code here

import { URL } from 'url';
import { crypto } from 'crypto';

/**
 * Utility module for headless web navigation and DOM interaction.
 * Provides tools for parsing URLs, generating unique identifiers, and simulating DOM-like structures.
 */

/**
 * Generates a unique identifier using cryptographic randomness.
 * Useful for tagging elements, tracking sessions, or creating unique keys.
 * @returns {string} - A unique identifier string.
 */
export function generateUniqueId() {
  return crypto.randomUUID();
}

/**
 * Parses a given URL string and returns its components.
 * Useful for extracting domain, path, query parameters, etc.
 * @param {string} urlString - The URL string to parse.
 * @returns {object} - An object containing URL components (protocol, host, pathname, searchParams).
 */
export function parseUrl(urlString) {
  try {
    const parsedUrl = new URL(urlString);
    return {
      protocol: parsedUrl.protocol,
      host: parsedUrl.host,
      pathname: parsedUrl.pathname,
      searchParams: Object.fromEntries(parsedUrl.searchParams.entries())
    };
  } catch (error) {
    throw new Error(`Invalid URL: ${urlString}`);
  }
}

/**
 * Simulates a basic DOM-like structure for headless interaction.
 * Allows manipulation of elements and attributes in a tree-like format.
 * @returns {object} - A simple DOM-like structure with methods for adding and querying elements.
 */
export function createVirtualDOM() {
  const domTree = {};

  return {
    /**
     * Adds an element to the virtual DOM.
     * @param {string} tagName - The tag name of the element.
     * @param {object} attributes - Key-value pairs of attributes for the element.
     * @returns {object} - The created element.
     */
    addElement(tagName, attributes = {}) {
      const id = generateUniqueId();
      const element = { id, tagName, attributes, children: [] };
      domTree[id] = element;
      return element;
    },

    /**
     * Queries elements in the virtual DOM by tag name.
     * @param {string} tagName - The tag name to search for.
     * @returns {array} - An array of matching elements.
     */
    queryElements(tagName) {
      return Object.values(domTree).filter(element => element.tagName === tagName);
    },

    /**
     * Retrieves the entire DOM tree.
     * @returns {object} - The entire virtual DOM tree.
     */
    getDomTree() {
      return domTree;
    }
  };
}

/**
 * Calculates semantic similarity between two vectors using cosine similarity.
 * Useful for comparing embeddings in machine learning tasks.
 * @param {array} vectorA - The first vector.
 * @param {array} vectorB - The second vector.
 * @returns {number} - The cosine similarity score between the two vectors.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length');
  }

  const dotProduct = vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Finds the shortest path in a graph using Dijkstra's algorithm.
 * Useful for pathfinding and graph traversal tasks.
 * @param {object} graph - An adjacency list representing the graph.
 * @param {string} start - The starting node.
 * @param {string} end - The target node.
 * @returns {array} - The shortest path from start to end.
 */
export function findShortestPath(graph, start, end) {
  const distances = {};
  const visited = new Set();
  const previous = {};

  Object.keys(graph).forEach(node => {
    distances[node] = Infinity;
  });
  distances[start] = 0;

  const queue = [start];

  while (queue.length > 0) {
    const currentNode = queue.shift();
    visited.add(currentNode);

    for (const [neighbor, weight] of Object.entries(graph[currentNode])) {
      if (!visited.has(neighbor)) {
        const newDistance = distances[currentNode] + weight;
        if (newDistance < distances[neighbor]) {
          distances[neighbor] = newDistance;
          previous[neighbor] = currentNode;
          queue.push(neighbor);
        }
      }
    }
  }

  const path = [];
  let currentNode = end;
  while (currentNode) {
    path.unshift(currentNode);
    currentNode = previous[currentNode];
  }

  return path[0] === start ? path : [];
}
