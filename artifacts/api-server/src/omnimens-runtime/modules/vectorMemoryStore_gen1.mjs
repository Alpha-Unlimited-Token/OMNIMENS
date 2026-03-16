/**
 * @module vectorMemoryStore
 * @description A utility module for storing and retrieving vector embeddings, enabling extended conversational memory and efficient similarity search.
 */

/**
 * VectorMemoryStore class for managing vector embeddings and performing approximate nearest neighbor search.
 */
class VectorMemoryStore {
  constructor() {
    /**
     * @private
     * @type {Map<number, number[]>}
     * Stores vectors with unique IDs.
     */
    this.store = new Map();
  }

  /**
   * Adds a vector to the store.
   * @param {number} id - Unique identifier for the vector.
   * @param {number[]} vector - The vector to store.
   */
  addVector(id, vector) {
    if (!Array.isArray(vector)) {
      throw new Error("Vector must be an array of numbers.");
    }
    if (this.store.has(id)) {
      throw new Error(`ID ${id} already exists in the store.`);
    }
    this.store.set(id, vector);
  }

  /**
   * Retrieves a vector by ID.
   * @param {number} id - Unique identifier of the vector.
   * @returns {number[] | null} - The vector if found, or null if not.
   */
  getVector(id) {
    return this.store.get(id) || null;
  }

  /**
   * Finds the nearest neighbors to a given query vector.
   * @param {number[]} queryVector - The vector to search for neighbors.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {Array<{id: number, distance: number}>} - Array of nearest neighbors with their IDs and distances.
   */
  findNearestNeighbors(queryVector, k) {
    if (!Array.isArray(queryVector)) {
      throw new Error("Query vector must be an array of numbers.");
    }
    if (k <= 0) {
      throw new Error("Number of neighbors (k) must be greater than 0.");
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
   * Calculates the Euclidean distance between two vectors.
   * @private
   * @param {number[]} vectorA - First vector.
   * @param {number[]} vectorB - Second vector.
   * @returns {number} - Euclidean distance between the vectors.
   */
  _euclideanDistance(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
      throw new Error("Vectors must have the same length.");
    }

    return Math.sqrt(
      vectorA.reduce((sum, value, index) => sum + Math.pow(value - vectorB[index], 2), 0)
    );
  }
}

/**
 * Exports the VectorMemoryStore class.
 */
export { VectorMemoryStore };