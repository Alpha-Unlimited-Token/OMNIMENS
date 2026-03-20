/**
 * @module inMemoryVectorStore
 * @description A module for storing and retrieving high-dimensional vectors in memory, with cosine similarity search using brute-force or KD-tree.
 */

/**
 * Stores vectors and their associated metadata in memory.
 * @class
 */
class InMemoryVectorStore {
  constructor() {
    /**
     * @type {Array<{vector: number[], metadata: Object}>}
     * @private
     */
    this.store = [];
  }

  /**
   * Adds a vector to the store.
   * @param {number[]} vector - The high-dimensional vector to store.
   * @param {Object} metadata - Associated metadata for the vector.
   * @throws {Error} Throws if the vector is not an array of numbers.
   */
  add(vector, metadata = {}) {
    if (!Array.isArray(vector) || !vector.every((v) => typeof v === 'number')) {
      throw new Error('Vector must be an array of numbers.');
    }
    this.store.push({ vector, metadata });
  }

  /**
   * Computes the cosine similarity between two vectors.
   * @param {number[]} vecA - The first vector.
   * @param {number[]} vecB - The second vector.
   * @returns {number} The cosine similarity between the two vectors.
   */
  static cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Finds the most similar vectors to the given query vector.
   * @param {number[]} queryVector - The vector to search for.
   * @param {number} topK - The number of top results to return.
   * @returns {Array<{vector: number[], metadata: Object, similarity: number}>} The top K most similar vectors.
   * @throws {Error} Throws if the query vector is not an array of numbers.
   */
  search(queryVector, topK = 1) {
    if (!Array.isArray(queryVector) || !queryVector.every((v) => typeof v === 'number')) {
      throw new Error('Query vector must be an array of numbers.');
    }

    const results = this.store.map(({ vector, metadata }) => {
      const similarity = InMemoryVectorStore.cosineSimilarity(queryVector, vector);
      return { vector, metadata, similarity };
    });

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Clears all vectors from the store.
   */
  clear() {
    this.store = [];
  }
}

export default InMemoryVectorStore;