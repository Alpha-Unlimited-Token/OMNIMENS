/**
 * @module semanticMemoryCache
 * @description Provides in-memory storage and retrieval of embeddings for semantic similarity searches using a Redis-backed or JavaScript-based ANN search.
 */

import { createServer } from "http";

/**
 * @typedef {Object} Vector
 * @property {number[]} values - The numerical values of the vector.
 */

/**
 * @typedef {Object} CacheItem
 * @property {string} id - Unique identifier for the item.
 * @property {Vector} vector - The vector representation of the item.
 */

/**
 * @class SemanticMemoryCache
 * @description A fast in-memory cache for storing and retrieving semantic embeddings with approximate nearest neighbor search.
 */
export class SemanticMemoryCache {
  constructor() {
    /** @type {Map<string, CacheItem>} */
    this.cache = new Map();
  }

  /**
   * Adds a vector to the cache.
   * @param {string} id - Unique identifier for the vector.
   * @param {number[]} vector - The numerical vector to store.
   * @throws {Error} If the vector is not valid.
   */
  addVector(id, vector) {
    if (!Array.isArray(vector) || vector.some(v => typeof v !== 'number')) {
      throw new Error('Vector must be an array of numbers.');
    }
    this.cache.set(id, { id, vector: { values: vector } });
  }

  /**
   * Finds the nearest vector to the given query vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {CacheItem[]} The nearest neighbors.
   */
  findNearest(queryVector, k = 1) {
    if (!Array.isArray(queryVector) || queryVector.some(v => typeof v !== 'number')) {
      throw new Error('Query vector must be an array of numbers.');
    }

    const distances = [];

    for (const [id, item] of this.cache.entries()) {
      const distance = this._calculateDistance(queryVector, item.vector.values);
      distances.push({ id, distance });
    }

    distances.sort((a, b) => a.distance - b.distance);

    return distances.slice(0, k).map(({ id }) => this.cache.get(id));
  }

  /**
   * Calculates the Euclidean distance between two vectors.
   * @param {number[]} vectorA - The first vector.
   * @param {number[]} vectorB - The second vector.
   * @returns {number} The Euclidean distance.
   */
  _calculateDistance(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must be of the same length.');
    }

    return Math.sqrt(
      vectorA.reduce((sum, a, i) => sum + Math.pow(a - vectorB[i], 2), 0)
    );
  }

  /**
   * Clears the cache.
   */
  clear() {
    this.cache.clear();
  }
}

/**
 * Example usage of the SemanticMemoryCache module.
 */
if (false) {
  const cache = new SemanticMemoryCache();

  // Add some vectors to the cache
  cache.addVector('item1', [1, 2, 3]);
  cache.addVector('item2', [4, 5, 6]);
  cache.addVector('item3', [7, 8, 9]);

  // Find the nearest vector to the query
  const nearest = cache.findNearest([5, 5, 5], 2);
  console.log('Nearest neighbors:', nearest);
}

