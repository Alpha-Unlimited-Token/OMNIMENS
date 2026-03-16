/**
 * @module inMemoryVectorStore
 * @description Provides fast similarity search for embeddings within the current session using cosine similarity.
 */

/**
 * Stores embeddings and their associated metadata for fast similarity search.
 */
class InMemoryVectorStore {
  constructor() {
    /**
     * @type {Array<{embedding: number[], metadata: any}>}
     * @description Array to store embeddings and their associated metadata.
     */
    this.store = [];
  }

  /**
   * Adds an embedding and its metadata to the store.
   * @param {number[]} embedding - The embedding vector.
   * @param {any} metadata - Associated metadata for the embedding.
   * @throws {Error} Throws if embedding is not an array of numbers.
   */
  add(embedding, metadata) {
    if (!Array.isArray(embedding) || !embedding.every(num => typeof num === 'number')) {
      throw new Error('Embedding must be an array of numbers.');
    }
    this.store.push({ embedding, metadata });
  }

  /**
   * Computes the cosine similarity between two vectors.
   * @param {number[]} vecA - First vector.
   * @param {number[]} vecB - Second vector.
   * @returns {number} Cosine similarity score.
   * @throws {Error} Throws if vectors are not of the same length.
   */
  static cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length.');
    }
    const dotProduct = vecA.reduce((sum, val, idx) => sum + val * vecB[idx], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Searches for the most similar embeddings in the store.
   * @param {number[]} queryEmbedding - The query embedding vector.
   * @param {number} topK - Number of top results to return.
   * @returns {Array<{metadata: any, similarity: number}>} Array of topK results sorted by similarity.
   * @throws {Error} Throws if queryEmbedding is not an array of numbers.
   */
  search(queryEmbedding, topK = 5) {
    if (!Array.isArray(queryEmbedding) || !queryEmbedding.every(num => typeof num === 'number')) {
      throw new Error('Query embedding must be an array of numbers.');
    }

    const results = this.store.map(({ embedding, metadata }) => {
      const similarity = InMemoryVectorStore.cosineSimilarity(queryEmbedding, embedding);
      return { metadata, similarity };
    });

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Clears all embeddings and metadata from the store.
   */
  clear() {
    this.store = [];
  }
}

/**
 * Creates a new instance of InMemoryVectorStore.
 * @returns {InMemoryVectorStore} A new vector store instance.
 */
export function createVectorStore() {
  return new InMemoryVectorStore();
}

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vecA - First vector.
 * @param {number[]} vecB - Second vector.
 * @returns {number} Cosine similarity score.
 */
export function cosineSimilarity(vecA, vecB) {
  return InMemoryVectorStore.cosineSimilarity(vecA, vecB);
}