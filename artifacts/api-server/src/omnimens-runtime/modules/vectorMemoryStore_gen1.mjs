/**
 * @module vectorMemoryStore
 * @description A utility module for fast vector embedding storage, retrieval, and similarity search using in-memory indexing.
 */

/**
 * A class to manage vector embeddings and perform similarity searches.
 */
class VectorMemoryStore {
  constructor() {
    /**
     * @private
     * @type {Map<string, number[]>}
     * A Map to store embeddings with unique keys.
     */
    this.store = new Map();
  }

  /**
   * Adds a vector embedding to the store.
   * @param {string} key - Unique identifier for the vector.
   * @param {number[]} vector - The vector embedding to store.
   * @throws {Error} If the key already exists or the vector is invalid.
   */
  addEmbedding(key, vector) {
    if (this.store.has(key)) {
      throw new Error(`Key '${key}' already exists in the store.`);
    }
    if (!Array.isArray(vector) || vector.some((v) => typeof v !== 'number')) {
      throw new Error('Vector must be an array of numbers.');
    }
    this.store.set(key, vector);
  }

  /**
   * Retrieves a vector embedding by its key.
   * @param {string} key - The unique identifier for the vector.
   * @returns {number[] | null} The vector embedding, or null if not found.
   */
  getEmbedding(key) {
    return this.store.get(key) || null;
  }

  /**
   * Performs a similarity search to find the closest vectors to a given query vector.
   * @param {number[]} queryVector - The query vector to compare against stored embeddings.
   * @param {number} topK - The number of closest matches to return.
   * @returns {Array<{ key: string, similarity: number }>} An array of top K matches sorted by similarity (cosine similarity).
   * @throws {Error} If the query vector is invalid or topK is not a positive integer.
   */
  similaritySearch(queryVector, topK) {
    if (!Array.isArray(queryVector) || queryVector.some((v) => typeof v !== 'number')) {
      throw new Error('Query vector must be an array of numbers.');
    }
    if (!Number.isInteger(topK) || topK <= 0) {
      throw new Error('topK must be a positive integer.');
    }

    /**
     * Computes the cosine similarity between two vectors.
     * @param {number[]} vecA - The first vector.
     * @param {number[]} vecB - The second vector.
     * @returns {number} The cosine similarity between vecA and vecB.
     */
    const cosineSimilarity = (vecA, vecB) => {
      const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
      const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
      const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
      return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
    };

    const results = [];

    for (const [key, vector] of this.store.entries()) {
      if (vector.length !== queryVector.length) {
        continue; // Skip vectors of different dimensions.
      }
      const similarity = cosineSimilarity(queryVector, vector);
      results.push({ key, similarity });
    }

    return results
      .sort((a, b) => b.similarity - a.similarity) // Sort by similarity in descending order.
      .slice(0, topK); // Return the top K results.
  }

  /**
   * Clears all stored embeddings.
   */
  clearStore() {
    this.store.clear();
  }
}

export { VectorMemoryStore };