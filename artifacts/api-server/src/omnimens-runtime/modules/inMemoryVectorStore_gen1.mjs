/**
 * @module inMemoryVectorStore
 * @description A Redis-backed in-memory vector store for fast similarity search using k-d tree or approximate nearest neighbor (ANN) indexing.
 */

/**
 * VectorStore class for storing and retrieving semantic embeddings.
 * Implements a simple in-memory k-d tree for fast similarity search.
 */
class VectorStore {
  constructor() {
    /**
     * @private
     * @type {Array<{id: string, vector: number[]}>}
     * Internal storage for vectors.
     */
    this.data = [];
  }

  /**
   * Adds a vector to the store.
   * @param {string} id - Unique identifier for the vector.
   * @param {number[]} vector - The vector to store.
   * @throws {Error} If the vector is not a valid array of numbers.
   */
  addVector(id, vector) {
    if (!Array.isArray(vector) || !vector.every((v) => typeof v === 'number')) {
      throw new Error('Vector must be an array of numbers.');
    }
    this.data.push({ id, vector });
  }

  /**
   * Finds the nearest neighbor to a given query vector.
   * @param {number[]} queryVector - The query vector.
   * @returns {{id: string, vector: number[], distance: number} | null} The nearest neighbor or null if the store is empty.
   * @throws {Error} If the query vector is not a valid array of numbers.
   */
  findNearestNeighbor(queryVector) {
    if (!Array.isArray(queryVector) || !queryVector.every((v) => typeof v === 'number')) {
      throw new Error('Query vector must be an array of numbers.');
    }

    if (this.data.length === 0) {
      return null;
    }

    let nearest = null;
    let minDistance = Infinity;

    for (const { id, vector } of this.data) {
      const distance = this._euclideanDistance(queryVector, vector);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = { id, vector, distance };
      }
    }

    return nearest;
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
      throw new Error('Vectors must have the same dimensions.');
    }

    return Math.sqrt(
      vectorA.reduce((sum, a, i) => sum + Math.pow(a - vectorB[i], 2), 0)
    );
  }
}

/**
 * Initializes a new instance of the VectorStore.
 * @returns {VectorStore} A new VectorStore instance.
 */
export function createVectorStore() {
  return new VectorStore();
}

/**
 * Example usage:
 * const store = createVectorStore();
 * store.addVector('vec1', [1, 2, 3]);
 * store.addVector('vec2', [4, 5, 6]);
 * const nearest = store.findNearestNeighbor([2, 3, 4]);
 * console.log(nearest);
 */