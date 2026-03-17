/**
 * @module inMemoryVectorStore
 * @description A utility module for storing high-dimensional embeddings and performing fast semantic similarity searches using cosine similarity.
 */

/**
 * Class representing an in-memory vector store with approximate nearest neighbor search.
 */
class InMemoryVectorStore {
  constructor() {
    /**
     * @type {Map<string, number[]>}
     * @private
     * A map to store vectors, keyed by unique IDs.
     */
    this.vectorMap = new Map();
  }

  /**
   * Adds a vector to the store.
   * @param {string} id - A unique identifier for the vector.
   * @param {number[]} vector - The high-dimensional vector to store.
   * @throws {Error} If the vector is not an array of numbers.
   */
  addVector(id, vector) {
    if (!Array.isArray(vector) || !vector.every((val) => typeof val === 'number')) {
      throw new Error('Vector must be an array of numbers.');
    }
    this.vectorMap.set(id, vector);
  }

  /**
   * Computes the cosine similarity between two vectors.
   * @param {number[]} vecA - The first vector.
   * @param {number[]} vecB - The second vector.
   * @returns {number} The cosine similarity between vecA and vecB.
   */
  static cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Finds the nearest neighbors to a given vector.
   * @param {number[]} queryVector - The vector to search for.
   * @param {number} k - The number of nearest neighbors to return.
   * @returns {Array<{id: string, similarity: number}>} An array of nearest neighbors with their IDs and similarity scores.
   */
  findNearestNeighbors(queryVector, k = 1) {
    if (!Array.isArray(queryVector) || !queryVector.every((val) => typeof val === 'number')) {
      throw new Error('Query vector must be an array of numbers.');
    }

    const similarities = [];

    for (const [id, vector] of this.vectorMap.entries()) {
      const similarity = InMemoryVectorStore.cosineSimilarity(queryVector, vector);
      similarities.push({ id, similarity });
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);
  }

  /**
   * Removes a vector from the store by its ID.
   * @param {string} id - The unique identifier of the vector to remove.
   * @returns {boolean} True if the vector was removed, false if not found.
   */
  removeVector(id) {
    return this.vectorMap.delete(id);
  }

  /**
   * Clears all vectors from the store.
   */
  clear() {
    this.vectorMap.clear();
  }

  /**
   * Returns the total number of vectors in the store.
   * @returns {number} The number of stored vectors.
   */
  size() {
    return this.vectorMap.size;
  }
}

export { InMemoryVectorStore };