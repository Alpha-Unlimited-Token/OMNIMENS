/**
 * @module inMemoryVectorStore
 * @description A utility module for storing and retrieving high-dimensional embeddings
 * for similarity searches using cosine similarity or approximate nearest neighbor search.
 */

/**
 * Stores high-dimensional vectors in memory and provides methods for similarity searches.
 */
class InMemoryVectorStore {
  constructor() {
    /**
     * @private
     * @type {Map<string, number[]>}
     * Stores vectors with their associated keys.
     */
    this.store = new Map();
  }

  /**
   * Adds a vector to the store.
   * @param {string} key - Unique identifier for the vector.
   * @param {number[]} vector - High-dimensional vector.
   * @throws {Error} If the key already exists or the vector is invalid.
   */
  addVector(key, vector) {
    if (this.store.has(key)) {
      throw new Error(`Key '${key}' already exists in the store.`);
    }
    if (!Array.isArray(vector) || vector.some((val) => typeof val !== 'number')) {
      throw new Error('Vector must be an array of numbers.');
    }
    this.store.set(key, vector);
  }

  /**
   * Removes a vector from the store.
   * @param {string} key - Unique identifier for the vector.
   * @throws {Error} If the key does not exist.
   */
  removeVector(key) {
    if (!this.store.has(key)) {
      throw new Error(`Key '${key}' does not exist in the store.`);
    }
    this.store.delete(key);
  }

  /**
   * Retrieves a vector by its key.
   * @param {string} key - Unique identifier for the vector.
   * @returns {number[]} The vector associated with the key.
   * @throws {Error} If the key does not exist.
   */
  getVector(key) {
    if (!this.store.has(key)) {
      throw new Error(`Key '${key}' does not exist in the store.`);
    }
    return this.store.get(key);
  }

  /**
   * Finds the most similar vectors to a given query vector using cosine similarity.
   * @param {number[]} queryVector - The vector to compare against.
   * @param {number} topN - Number of top similar vectors to retrieve.
   * @returns {Array<{key: string, similarity: number}>} Array of objects containing keys and similarity scores.
   * @throws {Error} If the query vector is invalid or topN is not a positive integer.
   */
  findMostSimilar(queryVector, topN = 1) {
    if (!Array.isArray(queryVector) || queryVector.some((val) => typeof val !== 'number')) {
      throw new Error('Query vector must be an array of numbers.');
    }
    if (!Number.isInteger(topN) || topN <= 0) {
      throw new Error('topN must be a positive integer.');
    }

    const cosineSimilarity = (vecA, vecB) => {
      const dotProduct = vecA.reduce((sum, val, idx) => sum + val * vecB[idx], 0);
      const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
      const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
      return dotProduct / (magnitudeA * magnitudeB);
    };

    const similarities = [];

    for (const [key, vector] of this.store.entries()) {
      const similarity = cosineSimilarity(queryVector, vector);
      similarities.push({ key, similarity });
    }

    similarities.sort((a, b) => b.similarity - a.similarity);

    return similarities.slice(0, topN);
  }

  /**
   * Clears all vectors from the store.
   */
  clearStore() {
    this.store.clear();
  }
}

/**
 * Exports an instance of the InMemoryVectorStore class.
 */
const vectorStore = new InMemoryVectorStore();

export { vectorStore, InMemoryVectorStore };