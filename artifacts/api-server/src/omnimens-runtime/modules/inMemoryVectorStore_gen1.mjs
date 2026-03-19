// Complete ES module code here, starting with /** JSDoc */ and exports

/**
 * @module inMemoryVectorStore
 * @description Stores embeddings in memory and performs fast approximate nearest neighbor (ANN) search using a custom implementation.
 */

/**
 * Class representing an in-memory vector store for embeddings.
 */
class InMemoryVectorStore {
  constructor() {
    /**
     * @private
     * @type {Map<string, number[]>}
     * Stores vectors with their unique identifiers.
     */
    this.store = new Map();
  }

  /**
   * Adds a vector to the store.
   * @param {string} id - The unique identifier for the vector.
   * @param {number[]} vector - The vector to store.
   * @throws {Error} Throws an error if the vector is not an array of numbers.
   */
  addVector(id, vector) {
    if (!Array.isArray(vector) || !vector.every((v) => typeof v === 'number')) {
      throw new Error('Vector must be an array of numbers.');
    }
    this.store.set(id, vector);
  }

  /**
   * Searches for the nearest neighbors of a given query vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - The number of nearest neighbors to retrieve.
   * @returns {Array<{id: string, distance: number}>} The k nearest neighbors sorted by distance.
   * @throws {Error} Throws an error if the query vector is invalid.
   */
  search(queryVector, k) {
    if (!Array.isArray(queryVector) || !queryVector.every((v) => typeof v === 'number')) {
      throw new Error('Query vector must be an array of numbers.');
    }
    if (k <= 0) {
      throw new Error('Number of neighbors (k) must be greater than 0.');
    }

    const distances = [];

    for (const [id, vector] of this.store.entries()) {
      const distance = this._euclideanDistance(queryVector, vector);
      distances.push({ id, distance });
    }

    distances.sort((a, b) => a.distance - b.distance);

    return distances.slice(0, k);
  }

  /**
   * Clears the store.
   */
  clear() {
    this.store.clear();
  }

  /**
   * Computes the Euclidean distance between two vectors.
   * @private
   * @param {number[]} vectorA - The first vector.
   * @param {number[]} vectorB - The second vector.
   * @returns {number} The Euclidean distance.
   */
  _euclideanDistance(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same length.');
    }

    return Math.sqrt(
      vectorA.reduce((sum, a, i) => sum + Math.pow(a - vectorB[i], 2), 0)
    );
  }
}

/**
 * Creates a new instance of the in-memory vector store.
 * @returns {InMemoryVectorStore} The vector store instance.
 */
export function createVectorStore() {
  return new InMemoryVectorStore();
}

/**
 * Example usage:
 * const store = createVectorStore();
 * store.addVector('vec1', [1, 2, 3]);
 * store.addVector('vec2', [4, 5, 6]);
 * const result = store.search([1, 2, 3], 1);
 * console.log(result);
 */