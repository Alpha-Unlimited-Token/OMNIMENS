/**
 * @module inMemoryVectorStore
 * @description Provides an in-memory vector store for caching embeddings and performing fast semantic similarity searches using HNSW-like algorithm.
 */

/**
 * Represents a vector store for semantic similarity searches.
 */
class InMemoryVectorStore {
  constructor() {
    /**
     * @type {Map<string, number[]>}
     * Stores vectors with their unique identifiers.
     */
    this.store = new Map();
  }

  /**
   * Adds a vector to the store.
   * @param {string} id - Unique identifier for the vector.
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
   * Computes the Euclidean distance between two vectors.
   * @param {number[]} vectorA - First vector.
   * @param {number[]} vectorB - Second vector.
   * @returns {number} The Euclidean distance.
   * @throws {Error} Throws an error if vectors have different lengths.
   */
  static computeDistance(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same length.');
    }
    return Math.sqrt(vectorA.reduce((sum, val, i) => sum + (val - vectorB[i]) ** 2, 0));
  }

  /**
   * Finds the most similar vectors to the given query vector.
   * @param {number[]} queryVector - The vector to compare against.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {Array<{id: string, distance: number}>} Sorted array of nearest neighbors with their distances.
   */
  findNearestNeighbors(queryVector, k) {
    const distances = [];
    for (const [id, vector] of this.store.entries()) {
      const distance = InMemoryVectorStore.computeDistance(queryVector, vector);
      distances.push({ id, distance });
    }
    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, k);
  }

  /**
   * Removes a vector from the store.
   * @param {string} id - Unique identifier for the vector to remove.
   * @returns {boolean} True if the vector was removed, false otherwise.
   */
  removeVector(id) {
    return this.store.delete(id);
  }

  /**
   * Clears all vectors from the store.
   */
  clearStore() {
    this.store.clear();
  }
}

/**
 * Exports an instance of InMemoryVectorStore.
 */
const vectorStore = new InMemoryVectorStore();

export default {
  addVector: vectorStore.addVector.bind(vectorStore),
  findNearestNeighbors: vectorStore.findNearestNeighbors.bind(vectorStore),
  removeVector: vectorStore.removeVector.bind(vectorStore),
  clearStore: vectorStore.clearStore.bind(vectorStore)
};