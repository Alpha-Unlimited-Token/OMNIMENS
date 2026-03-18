/**
 * @module dynamicVectorStore
 * @description A high-performance in-memory vector store for embedding retrieval and indexing,
 *              featuring approximate nearest neighbor search.
 */

/**
 * Represents a dynamic vector store for fast embedding storage and retrieval.
 */
class DynamicVectorStore {
  constructor() {
    /**
     * Internal hash map to store vectors by unique keys.
     * @type {Map<string, number[]>}
     */
    this.vectorMap = new Map();
  }

  /**
   * Adds a new vector to the store.
   * @param {string} key - Unique identifier for the vector.
   * @param {number[]} vector - The embedding vector to store.
   * @throws {Error} If the key already exists or the vector is invalid.
   */
  addVector(key, vector) {
    if (this.vectorMap.has(key)) {
      throw new Error(`Key '${key}' already exists in the vector store.`);
    }
    if (!Array.isArray(vector) || vector.some(isNaN)) {
      throw new Error('Invalid vector: must be an array of numbers.');
    }
    this.vectorMap.set(key, vector);
  }

  /**
   * Retrieves a vector by its key.
   * @param {string} key - The unique identifier for the vector.
   * @returns {number[] | null} The vector if found, or null if not.
   */
  getVector(key) {
    return this.vectorMap.get(key) || null;
  }

  /**
   * Finds the nearest neighbors to a given query vector using cosine similarity.
   * @param {number[]} queryVector - The query embedding vector.
   * @param {number} k - The number of nearest neighbors to retrieve.
   * @returns {Array<{ key: string, similarity: number }>} An array of the k nearest neighbors with their similarity scores.
   * @throws {Error} If the query vector is invalid or k is not a positive integer.
   */
  findNearestNeighbors(queryVector, k) {
    if (!Array.isArray(queryVector) || queryVector.some(isNaN)) {
      throw new Error('Invalid query vector: must be an array of numbers.');
    }
    if (!Number.isInteger(k) || k <= 0) {
      throw new Error('Invalid k: must be a positive integer.');
    }

    /**
     * Computes the cosine similarity between two vectors.
     * @param {number[]} vecA - First vector.
     * @param {number[]} vecB - Second vector.
     * @returns {number} The cosine similarity score.
     */
    const cosineSimilarity = (vecA, vecB) => {
      const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
      const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
      const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
      return dotProduct / (magnitudeA * magnitudeB || 1);
    };

    const similarities = [];

    for (const [key, vector] of this.vectorMap.entries()) {
      if (vector.length !== queryVector.length) {
        continue; // Skip vectors of mismatched dimensions.
      }
      const similarity = cosineSimilarity(queryVector, vector);
      similarities.push({ key, similarity });
    }

    // Sort by similarity in descending order and return the top k results.
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);
  }

  /**
   * Removes a vector from the store by its key.
   * @param {string} key - The unique identifier for the vector to remove.
   * @returns {boolean} True if the vector was removed, false if not found.
   */
  removeVector(key) {
    return this.vectorMap.delete(key);
  }

  /**
   * Clears all vectors from the store.
   */
  clearStore() {
    this.vectorMap.clear();
  }
}

/**
 * Exports the DynamicVectorStore class.
 */
export default DynamicVectorStore;