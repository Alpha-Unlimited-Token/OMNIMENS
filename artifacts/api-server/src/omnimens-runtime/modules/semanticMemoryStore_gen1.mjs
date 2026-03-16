/**
 * @module semanticMemoryStore
 * @description Provides lightweight in-memory vector embedding storage for efficient semantic retrieval
 *              using cosine similarity and approximate nearest neighbor (ANN) search.
 */

/**
 * A class representing the Semantic Memory Store.
 * This class allows storing and retrieving vector embeddings efficiently.
 */
class SemanticMemoryStore {
  constructor() {
    /**
     * @type {Map<string, number[]>}
     * A map to store embeddings with unique string keys.
     */
    this.store = new Map();
  }

  /**
   * Adds a vector embedding to the store.
   * @param {string} key - A unique identifier for the embedding.
   * @param {number[]} vector - The vector embedding to store.
   * @throws {Error} Throws if the key already exists or the vector is invalid.
   */
  addEmbedding(key, vector) {
    if (this.store.has(key)) {
      throw new Error(`Key '${key}' already exists in the store.`);
    }
    if (!Array.isArray(vector) || vector.some(isNaN)) {
      throw new Error('Vector must be an array of numbers.');
    }
    this.store.set(key, vector);
  }

  /**
   * Computes the cosine similarity between two vectors.
   * @private
   * @param {number[]} vectorA - The first vector.
   * @param {number[]} vectorB - The second vector.
   * @returns {number} The cosine similarity between the two vectors.
   */
  _cosineSimilarity(vectorA, vectorB) {
    const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));
    return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
  }

  /**
   * Retrieves the most similar embeddings to a given query vector.
   * @param {number[]} queryVector - The query vector for similarity search.
   * @param {number} topK - The number of top results to return.
   * @returns {Array<{ key: string, similarity: number }>} The top K most similar embeddings.
   * @throws {Error} Throws if the query vector is invalid or topK is not a positive integer.
   */
  search(queryVector, topK = 5) {
    if (!Array.isArray(queryVector) || queryVector.some(isNaN)) {
      throw new Error('Query vector must be an array of numbers.');
    }
    if (!Number.isInteger(topK) || topK <= 0) {
      throw new Error('topK must be a positive integer.');
    }

    const similarities = Array.from(this.store.entries()).map(([key, vector]) => ({
      key,
      similarity: this._cosineSimilarity(queryVector, vector)
    }));

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Removes an embedding from the store by its key.
   * @param {string} key - The key of the embedding to remove.
   * @returns {boolean} True if the key was found and removed, otherwise false.
   */
  removeEmbedding(key) {
    return this.store.delete(key);
  }

  /**
   * Clears all embeddings from the store.
   */
  clearStore() {
    this.store.clear();
  }
}

/**
 * Exports the SemanticMemoryStore class.
 */
export { SemanticMemoryStore };