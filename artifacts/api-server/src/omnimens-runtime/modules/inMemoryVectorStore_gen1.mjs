/**
 * @module inMemoryVectorStore
 * @description A module for storing and retrieving vector embeddings using cosine similarity for semantic search and context retention.
 */

/**
 * Stores vector embeddings in memory and provides functionality for similarity-based retrieval.
 */
class InMemoryVectorStore {
  constructor() {
    /**
     * @private
     * @type {Array<{id: string, embedding: number[]}>}
     * Array to store embeddings with unique IDs.
     */
    this.store = [];
  }

  /**
   * Adds a new embedding to the store.
   * @param {string} id - A unique identifier for the embedding.
   * @param {number[]} embedding - The vector embedding to store.
   * @throws {Error} If the embedding is not an array of numbers.
   */
  addEmbedding(id, embedding) {
    if (!Array.isArray(embedding) || !embedding.every((val) => typeof val === 'number')) {
      throw new Error('Embedding must be an array of numbers.');
    }
    this.store.push({ id, embedding });
  }

  /**
   * Finds the most similar embeddings to a given query vector using cosine similarity.
   * @param {number[]} query - The query vector.
   * @param {number} topK - The number of top results to return.
   * @returns {Array<{id: string, similarity: number}>} Sorted array of IDs and their similarity scores.
   * @throws {Error} If the query is not an array of numbers.
   */
  search(query, topK = 5) {
    if (!Array.isArray(query) || !query.every((val) => typeof val === 'number')) {
      throw new Error('Query must be an array of numbers.');
    }

    // Normalize the query vector
    const queryNorm = this.#vectorNorm(query);
    if (queryNorm === 0) {
      throw new Error('Query vector norm cannot be zero.');
    }
    const normalizedQuery = query.map((val) => val / queryNorm);

    // Compute cosine similarity for each embedding in the store
    const similarities = this.store.map(({ id, embedding }) => {
      const embeddingNorm = this.#vectorNorm(embedding);
      if (embeddingNorm === 0) {
        return { id, similarity: 0 };
      }
      const normalizedEmbedding = embedding.map((val) => val / embeddingNorm);
      const similarity = this.#cosineSimilarity(normalizedQuery, normalizedEmbedding);
      return { id, similarity };
    });

    // Sort by similarity in descending order and return the top K results
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Computes the cosine similarity between two vectors.
   * @private
   * @param {number[]} vecA - The first vector.
   * @param {number[]} vecB - The second vector.
   * @returns {number} The cosine similarity between the two vectors.
   */
  #cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, val, index) => sum + val * vecB[index], 0);
    return dotProduct;
  }

  /**
   * Computes the Euclidean norm (magnitude) of a vector.
   * @private
   * @param {number[]} vector - The vector.
   * @returns {number} The norm of the vector.
   */
  #vectorNorm(vector) {
    return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  }
}

/**
 * Factory function to create a new instance of InMemoryVectorStore.
 * @returns {InMemoryVectorStore} A new instance of the vector store.
 */
export function createVectorStore() {
  return new InMemoryVectorStore();
}

/**
 * Utility function to compute cosine similarity between two vectors directly.
 * @param {number[]} vecA - The first vector.
 * @param {number[]} vecB - The second vector.
 * @returns {number} The cosine similarity between the two vectors.
 * @throws {Error} If the vectors are not of the same length or contain invalid data.
 */
export function computeCosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must be of the same length.');
  }
  const store = new InMemoryVectorStore();
  return store.#cosineSimilarity(vecA, vecB);
}
