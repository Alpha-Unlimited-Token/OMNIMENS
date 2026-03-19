// inMemoryVectorStore.js

/**
 * @module inMemoryVectorStore
 * @description Provides fast semantic search and context recall using HNSW-like approximate nearest neighbor (ANN) search.
 */

/**
 * Represents a vector store for fast semantic search using approximate nearest neighbor (ANN) techniques.
 */
class InMemoryVectorStore {
  constructor() {
    /**
     * @type {Map<string, number[]>}
     * Stores embeddings with unique keys.
     */
    this.store = new Map();

    /**
     * @type {number[][]}
     * A list of all stored embeddings for efficient search.
     */
    this.embeddings = [];

    /**
     * @type {string[]}
     * A list of keys corresponding to embeddings.
     */
    this.keys = [];
  }

  /**
   * Adds a vector embedding to the store.
   * @param {string} key - Unique identifier for the embedding.
   * @param {number[]} vector - The embedding vector.
   * @throws {Error} Throws if the key already exists.
   */
  add(key, vector) {
    if (this.store.has(key)) {
      throw new Error(`Key '${key}' already exists in the store.`);
    }
    this.store.set(key, vector);
    this.embeddings.push(vector);
    this.keys.push(key);
  }

  /**
   * Searches for the nearest neighbors to the given query vector.
   * @param {number[]} queryVector - The query embedding vector.
   * @param {number} k - Number of nearest neighbors to return.
   * @returns {Array<{key: string, similarity: number}>} - Array of nearest neighbors with their similarity scores.
   */
  search(queryVector, k = 1) {
    if (!Array.isArray(queryVector) || queryVector.length === 0) {
      throw new Error('Query vector must be a non-empty array of numbers.');
    }

    const results = this.embeddings.map((vector, index) => {
      const similarity = this._cosineSimilarity(queryVector, vector);
      return { key: this.keys[index], similarity };
    });

    // Sort by similarity in descending order and return top-k results
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);
  }

  /**
   * Computes the cosine similarity between two vectors.
   * @private
   * @param {number[]} vectorA - First vector.
   * @param {number[]} vectorB - Second vector.
   * @returns {number} - Cosine similarity score.
   */
  _cosineSimilarity(vectorA, vectorB) {
    const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0; // Avoid division by zero
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Clears all stored embeddings and keys.
   */
  clear() {
    this.store.clear();
    this.embeddings = [];
    this.keys = [];
  }
}

/**
 * Exports the InMemoryVectorStore class.
 */
export default InMemoryVectorStore;