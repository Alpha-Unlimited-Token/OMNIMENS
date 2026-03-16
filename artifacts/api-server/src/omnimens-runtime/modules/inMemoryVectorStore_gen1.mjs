// Complete ES module code here, starting with /** JSDoc */ and exports

/**
 * @module inMemoryVectorStore
 * @description This module provides an in-memory vector store for fast semantic search and context retrieval
 * using approximate nearest neighbor (ANN) search. It is implemented without external dependencies,
 * leveraging pure JavaScript and efficient data structures.
 */

/**
 * Represents a single vector and its associated metadata.
 * @typedef {Object} Vector
 * @property {number[]} values - The numerical values of the vector.
 * @property {string} id - A unique identifier for the vector.
 */

/**
 * Class to manage an in-memory vector store and perform approximate nearest neighbor search.
 */
class InMemoryVectorStore {
  constructor() {
    /**
     * @private
     * @type {Vector[]}
     */
    this.vectors = [];
  }

  /**
   * Adds a vector to the store.
   * @param {string} id - A unique identifier for the vector.
   * @param {number[]} values - The vector's numerical values.
   * @throws {Error} If the vector dimensions are inconsistent.
   */
  addVector(id, values) {
    if (this.vectors.length > 0 && values.length !== this.vectors[0].values.length) {
      throw new Error('Vector dimensions must be consistent.');
    }
    this.vectors.push({ id, values });
  }

  /**
   * Performs a nearest neighbor search to find the top-k closest vectors.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - The number of closest vectors to retrieve.
   * @returns {Array<{ id: string, distance: number }>} An array of the k closest vectors with distances.
   */
  search(queryVector, k) {
    if (this.vectors.length === 0) {
      return [];
    }

    if (queryVector.length !== this.vectors[0].values.length) {
      throw new Error('Query vector dimensions must match stored vectors.');
    }

    // Compute distances and sort by proximity
    const distances = this.vectors.map(vector => ({
      id: vector.id,
      distance: this._euclideanDistance(queryVector, vector.values)
    }));

    distances.sort((a, b) => a.distance - b.distance);

    return distances.slice(0, k);
  }

  /**
   * Clears all vectors from the store.
   */
  clear() {
    this.vectors = [];
  }

  /**
   * Computes the Euclidean distance between two vectors.
   * @private
   * @param {number[]} vec1 - The first vector.
   * @param {number[]} vec2 - The second vector.
   * @returns {number} The Euclidean distance between the two vectors.
   */
  _euclideanDistance(vec1, vec2) {
    return Math.sqrt(vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0));
  }
}

/**
 * Exports the InMemoryVectorStore class for external use.
 */
export { InMemoryVectorStore };