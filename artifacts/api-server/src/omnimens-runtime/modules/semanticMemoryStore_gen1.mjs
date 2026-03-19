/**
 * @module semanticMemoryStore
 * @description Provides in-memory semantic search and embedding retrieval using hash-based indexing and cosine similarity for efficient runtime context management.
 */

/**
 * Calculates cosine similarity between two embedding vectors.
 * @param {number[]} vectorA - First embedding vector.
 * @param {number[]} vectorB - Second embedding vector.
 * @returns {number} Cosine similarity score between -1 and 1.
 */
function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must be of the same length.");
  }

  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Class representing a semantic memory store for embeddings.
 */
class SemanticMemoryStore {
  constructor() {
    /**
     * Internal storage for embeddings and their associated metadata.
     * @type {Map<string, {embedding: number[], metadata: object}>}
     */
    this.store = new Map();
  }

  /**
   * Adds an embedding and its metadata to the store.
   * @param {string} id - Unique identifier for the embedding.
   * @param {number[]} embedding - The embedding vector.
   * @param {object} metadata - Additional metadata associated with the embedding.
   */
  addEmbedding(id, embedding, metadata = {}) {
    if (!Array.isArray(embedding) || embedding.some(isNaN)) {
      throw new Error("Embedding must be an array of numbers.");
    }

    this.store.set(id, { embedding, metadata });
  }

  /**
   * Searches for the most similar embeddings in the store based on a query embedding.
   * @param {number[]} queryEmbedding - The query embedding vector.
   * @param {number} topK - Number of top results to return.
   * @returns {Array<{id: string, similarity: number, metadata: object}>} Sorted results by similarity.
   */
  search(queryEmbedding, topK = 5) {
    if (!Array.isArray(queryEmbedding) || queryEmbedding.some(isNaN)) {
      throw new Error("Query embedding must be an array of numbers.");
    }

    const results = [];

    for (const [id, { embedding, metadata }] of this.store.entries()) {
      const similarity = cosineSimilarity(queryEmbedding, embedding);
      results.push({ id, similarity, metadata });
    }

    return results
      .sort((a, b) => b.similarity - a.similarity) // Sort by highest similarity
      .slice(0, topK); // Return top K results
  }

  /**
   * Clears all stored embeddings and metadata.
   */
  clear() {
    this.store.clear();
  }
}

/**
 * Exports the SemanticMemoryStore class and cosineSimilarity function.
 */
export { SemanticMemoryStore, cosineSimilarity };