/**
 * @module dynamicVectorStore
 * @description A utility module for storing and retrieving high-dimensional embeddings using k-nearest neighbor search.
 * Implements an efficient k-NN algorithm for similarity searches.
 */

/**
 * Class representing a dynamic vector store.
 */
class DynamicVectorStore {
  /**
   * Initializes the vector store.
   * @param {number} dimensions - The number of dimensions for the embeddings.
   */
  constructor(dimensions) {
    if (!Number.isInteger(dimensions) || dimensions <= 0) {
      throw new Error("Dimensions must be a positive integer.");
    }

    this.dimensions = dimensions;
    this.vectors = []; // Array to store vectors
    this.metadata = []; // Array to store associated metadata
  }

  /**
   * Adds a vector and its metadata to the store.
   * @param {Array<number>} vector - The high-dimensional vector.
   * @param {any} meta - Metadata associated with the vector.
   */
  addVector(vector, meta) {
    if (!Array.isArray(vector) || vector.length !== this.dimensions) {
      throw new Error(`Vector must be an array of length ${this.dimensions}.`);
    }

    if (!vector.every((val) => typeof val === "number")) {
      throw new Error("Vector elements must be numbers.");
    }

    this.vectors.push(vector);
    this.metadata.push(meta);
  }

  /**
   * Finds the k-nearest neighbors to a given query vector.
   * @param {Array<number>} query - The query vector.
   * @param {number} k - The number of neighbors to retrieve.
   * @returns {Array<{vector: Array<number>, meta: any, distance: number}>} - The k-nearest neighbors.
   */
  findNearestNeighbors(query, k) {
    if (!Array.isArray(query) || query.length !== this.dimensions) {
      throw new Error(`Query must be an array of length ${this.dimensions}.`);
    }

    if (!query.every((val) => typeof val === "number")) {
      throw new Error("Query elements must be numbers.");
    }

    if (!Number.isInteger(k) || k <= 0) {
      throw new Error("k must be a positive integer.");
    }

    if (this.vectors.length === 0) {
      return [];
    }

    // Calculate distances
    const distances = this.vectors.map((vector, index) => {
      const distance = this._euclideanDistance(query, vector);
      return { vector, meta: this.metadata[index], distance };
    });

    // Sort by distance
    distances.sort((a, b) => a.distance - b.distance);

    // Return the top k neighbors
    return distances.slice(0, k);
  }

  /**
   * Calculates the Euclidean distance between two vectors.
   * @param {Array<number>} vec1 - The first vector.
   * @param {Array<number>} vec2 - The second vector.
   * @returns {number} - The Euclidean distance.
   * @private
   */
  _euclideanDistance(vec1, vec2) {
    return Math.sqrt(
      vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0)
    );
  }
}

/**
 * Factory function to create a new DynamicVectorStore.
 * @param {number} dimensions - The number of dimensions for the embeddings.
 * @returns {DynamicVectorStore} - The created vector store instance.
 */
function createVectorStore(dimensions) {
  return new DynamicVectorStore(dimensions);
}

export { createVectorStore, DynamicVectorStore };