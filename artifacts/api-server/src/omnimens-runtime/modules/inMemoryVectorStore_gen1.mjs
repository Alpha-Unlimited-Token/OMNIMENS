/**
 * @module inMemoryVectorStore
 * @description This module provides an in-memory vector store for fast similarity searches using KD-tree or HNSW-based nearest neighbor search.
 * @author OMNIMENS
 */

/**
 * Represents a vector store capable of efficient nearest neighbor search.
 * Uses KD-tree for low-dimensional data and HNSW for high-dimensional data.
 */
class InMemoryVectorStore {
  constructor() {
    /**
     * @type {Array<Float32Array>} vectors - Stored vectors.
     */
    this.vectors = [];

    /**
     * @type {Array<Object>} metadata - Metadata associated with vectors.
     */
    this.metadata = [];

    /**
     * @type {Object} index - Holds the search index (KD-tree or HNSW).
     */
    this.index = null;
  }

  /**
   * Adds a vector and its associated metadata to the store.
   * @param {Float32Array} vector - The vector to store.
   * @param {Object} meta - Metadata associated with the vector.
   */
  addVector(vector, meta) {
    if (!(vector instanceof Float32Array)) {
      throw new TypeError('Vector must be a Float32Array.');
    }
    this.vectors.push(vector);
    this.metadata.push(meta);
    this.index = null; // Invalidate index.
  }

  /**
   * Builds the search index based on the stored vectors.
   * Automatically chooses KD-tree for low dimensions and HNSW for high dimensions.
   */
  buildIndex() {
    const dimensions = this.vectors[0]?.length || 0;
    if (dimensions === 0) {
      throw new Error('Cannot build index: no vectors stored.');
    }

    if (dimensions <= 10) {
      this.index = this._buildKDTree();
    } else {
      this.index = this._buildHNSW();
    }
  }

  /**
   * Searches for the nearest neighbors to a given query vector.
   * @param {Float32Array} queryVector - The vector to search for.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {Array<Object>} - Array of metadata for the nearest neighbors.
   */
  search(queryVector, k = 1) {
    if (!this.index) {
      throw new Error('Search index not built. Call buildIndex() first.');
    }

    if (!(queryVector instanceof Float32Array)) {
      throw new TypeError('Query vector must be a Float32Array.');
    }

    if (k <= 0) {
      throw new RangeError('k must be a positive integer.');
    }

    return this.index.search(queryVector, k).map(({ index }) => this.metadata[index]);
  }

  /**
   * Builds a KD-tree for low-dimensional data.
   * @private
   * @returns {Object} - KD-tree instance.
   */
  _buildKDTree() {
    const KDTree = require('./kdTree'); // Hypothetical internal KD-tree implementation.
    return new KDTree(this.vectors);
  }

  /**
   * Builds an HNSW graph for high-dimensional data.
   * @private
   * @returns {Object} - HNSW instance.
   */
  _buildHNSW() {
    const HNSW = require('./hnsw'); // Hypothetical internal HNSW implementation.
    return new HNSW(this.vectors);
  }
}

/**
 * Exports the InMemoryVectorStore class.
 */
module.exports = InMemoryVectorStore;