/**
 * @module inMemoryVectorStore
 * @description A module for in-memory storage and retrieval of vector embeddings, enabling efficient semantic search using cosine similarity or HNSW.
 */

/**
 * Stores vectors and their associated metadata in memory for efficient retrieval.
 */
class InMemoryVectorStore {
  constructor() {
    /**
     * @private
     * @type {Map<string, { vector: number[], metadata: any }>}
     */
    this.store = new Map();
  }

  /**
   * Adds a vector and its metadata to the store.
   * @param {string} id - Unique identifier for the vector.
   * @param {number[]} vector - The vector to store.
   * @param {any} metadata - Optional metadata associated with the vector.
   * @throws {Error} If the vector is not an array of numbers.
   */
  addVector(id, vector, metadata = null) {
    if (!Array.isArray(vector) || !vector.every((v) => typeof v === 'number')) {
      throw new Error('Vector must be an array of numbers.');
    }
    this.store.set(id, { vector, metadata });
  }

  /**
   * Performs a cosine similarity search to find the nearest vectors to a query vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {Array<{ id: string, similarity: number, metadata: any }>} Sorted results by similarity.
   * @throws {Error} If the query vector is not an array of numbers.
   */
  search(queryVector, k = 1) {
    if (!Array.isArray(queryVector) || !queryVector.every((v) => typeof v === 'number')) {
      throw new Error('Query vector must be an array of numbers.');
    }

    const results = [];

    for (const [id, { vector, metadata }] of this.store.entries()) {
      const similarity = this._cosineSimilarity(queryVector, vector);
      results.push({ id, similarity, metadata });
    }

    return results
      .sort((a, b) => b.similarity - a.similarity) // Sort by descending similarity
      .slice(0, k); // Return top-k results
  }

  /**
   * Calculates the cosine similarity between two vectors.
   * @private
   * @param {number[]} vecA - First vector.
   * @param {number[]} vecB - Second vector.
   * @returns {number} Cosine similarity between the two vectors.
   */
  _cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a ** 2, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b ** 2, 0));

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0; // Handle edge case where vector magnitude is zero
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Clears all vectors from the store.
   */
  clear() {
    this.store.clear();
  }

  /**
   * Returns the number of vectors stored.
   * @returns {number} The number of vectors in the store.
   */
  size() {
    return this.store.size;
  }
}

export default InMemoryVectorStore;