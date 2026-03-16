// inMemoryVectorStore.js

/**
 * @module inMemoryVectorStore
 * @description A utility module for fast similarity search of embeddings in Node.js using in-memory data structures.
 */

/**
 * Represents an in-memory vector store for embeddings.
 * @class
 */
class InMemoryVectorStore {
  constructor() {
    /**
     * Internal storage for embeddings.
     * @type {Map<string, Array<number>>}
     */
    this.store = new Map();
  }

  /**
   * Adds an embedding to the store.
   * @param {string} id - Unique identifier for the embedding.
   * @param {Array<number>} embedding - The embedding vector.
   * @throws {Error} If the embedding is not a valid numeric array.
   */
  addEmbedding(id, embedding) {
    if (!Array.isArray(embedding) || !embedding.every((num) => typeof num === 'number')) {
      throw new Error('Embedding must be an array of numbers.');
    }
    this.store.set(id, embedding);
  }

  /**
   * Finds the most similar embeddings to a given query vector.
   * @param {Array<number>} queryVector - The query embedding vector.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {Array<{id: string, similarity: number}>} The k most similar embeddings.
   * @throws {Error} If the queryVector is not a valid numeric array or k is not a positive integer.
   */
  findNearestNeighbors(queryVector, k) {
    if (!Array.isArray(queryVector) || !queryVector.every((num) => typeof num === 'number')) {
      throw new Error('Query vector must be an array of numbers.');
    }
    if (!Number.isInteger(k) || k <= 0) {
      throw new Error('k must be a positive integer.');
    }

    /**
     * Computes the cosine similarity between two vectors.
     * @param {Array<number>} vec1 - First vector.
     * @param {Array<number>} vec2 - Second vector.
     * @returns {number} Cosine similarity.
     */
    const cosineSimilarity = (vec1, vec2) => {
      const dotProduct = vec1.reduce((sum, val, idx) => sum + val * (vec2[idx] || 0), 0);
      const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val ** 2, 0));
      const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val ** 2, 0));
      return magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0;
    };

    const similarities = [];
    for (const [id, embedding] of this.store.entries()) {
      const similarity = cosineSimilarity(queryVector, embedding);
      similarities.push({ id, similarity });
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);
  }

  /**
   * Removes an embedding from the store by its ID.
   * @param {string} id - Unique identifier for the embedding to remove.
   * @returns {boolean} True if the embedding was removed, false otherwise.
   */
  removeEmbedding(id) {
    return this.store.delete(id);
  }

  /**
   * Clears all embeddings from the store.
   */
  clearStore() {
    this.store.clear();
  }
}

/**
 * Factory function to create a new instance of InMemoryVectorStore.
 * @returns {InMemoryVectorStore} A new vector store instance.
 */
const createVectorStore = () => new InMemoryVectorStore();

export { createVectorStore, InMemoryVectorStore };