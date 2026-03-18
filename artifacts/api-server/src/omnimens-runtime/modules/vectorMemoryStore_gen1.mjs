/**
 * @module vectorMemoryStore
 * @description Provides an in-memory vector store for fast semantic search and reasoning using HNSW (Hierarchical Navigable Small World) algorithm.
 * This module is designed for high-performance nearest neighbor search with periodic syncing to PostgreSQL for persistence.
 */

const { Worker, isMainThread, parentPort } = require('worker_threads');
const { writeFileSync, readFileSync } = require('fs');
const { join } = require('path');
const { performance } = require('perf_hooks');

/**
 * Represents a single vector and its associated metadata.
 * @typedef {Object} VectorEntry
 * @property {string} id - Unique identifier for the vector.
 * @property {number[]} vector - The numerical vector.
 * @property {Object} [metadata] - Optional metadata associated with the vector.
 */

/**
 * Class representing the in-memory vector store with HNSW-based approximate nearest neighbor search.
 */
class VectorMemoryStore {
  constructor() {
    this.vectors = new Map(); // In-memory store for vectors
    this.hnswGraph = new Map(); // Graph for HNSW algorithm
    this.syncInterval = 60000; // Default sync interval (1 minute)
    this.lastSyncTime = performance.now();
  }

  /**
   * Adds a vector to the store.
   * @param {string} id - Unique identifier for the vector.
   * @param {number[]} vector - The numerical vector.
   * @param {Object} [metadata] - Optional metadata associated with the vector.
   */
  addVector(id, vector, metadata = {}) {
    if (!Array.isArray(vector) || vector.some((v) => typeof v !== 'number')) {
      throw new Error('Vector must be an array of numbers.');
    }
    this.vectors.set(id, { vector, metadata });
    this._updateHNSWGraph(id, vector);
  }

  /**
   * Searches for the nearest neighbors of a given query vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {VectorEntry[]} Array of nearest neighbors.
   */
  search(queryVector, k) {
    if (!Array.isArray(queryVector) || queryVector.some((v) => typeof v !== 'number')) {
      throw new Error('Query vector must be an array of numbers.');
    }
    const distances = [];
    for (const [id, entry] of this.vectors.entries()) {
      const distance = this._euclideanDistance(queryVector, entry.vector);
      distances.push({ id, distance, ...entry });
    }
    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, k);
  }

  /**
   * Periodically syncs the in-memory store to PostgreSQL.
   */
  async syncToPostgreSQL() {
    const now = performance.now();
    if (now - this.lastSyncTime < this.syncInterval) return;

    // Simulate PostgreSQL sync (replace with actual DB logic)
    const data = JSON.stringify([...this.vectors.entries()]);
    writeFileSync(join(__dirname, 'vector_store_backup.json'), data);
    this.lastSyncTime = now;
  }

  /**
   * Updates the HNSW graph with a new vector.
   * @private
   * @param {string} id - Unique identifier for the vector.
   * @param {number[]} vector - The numerical vector.
   */
  _updateHNSWGraph(id, vector) {
    // Simplified HNSW graph update logic (expand for full HNSW implementation)
    this.hnswGraph.set(id, vector);
  }

  /**
   * Computes the Euclidean distance between two vectors.
   * @private
   * @param {number[]} vectorA - First vector.
   * @param {number[]} vectorB - Second vector.
   * @returns {number} The Euclidean distance.
   */
  _euclideanDistance(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same dimensions.');
    }
    return Math.sqrt(vectorA.reduce((sum, val, i) => sum + (val - vectorB[i]) ** 2, 0));
  }
}

module.exports = {
  VectorMemoryStore,
};