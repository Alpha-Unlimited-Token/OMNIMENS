/**
 * @module embeddingMemoryStore
 * @description Provides an in-memory store for embeddings, enabling fast similarity searches using cosine similarity.
 */

/**
 * Calculates the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The cosine similarity value between -1 and 1.
 * @throws {Error} - Throws if vectors have different lengths or are empty.
 */
function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length || vectorA.length === 0) {
    throw new Error('Vectors must have the same non-zero length.');
  }

  const dotProduct = vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error('Vectors must not be zero vectors.');
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * @class EmbeddingMemoryStore
 * @description In-memory store for embeddings with efficient similarity search.
 */
class EmbeddingMemoryStore {
  constructor() {
    /**
     * @type {Map<string, number[]>}
     * @description Stores embeddings as key-value pairs (id -> vector).
     */
    this.store = new Map();
  }

  /**
   * Adds an embedding to the store.
   * @param {string} id - Unique identifier for the embedding.
   * @param {number[]} vector - The embedding vector.
   * @throws {Error} - Throws if the id already exists or vector is invalid.
   */
  addEmbedding(id, vector) {
    if (this.store.has(id)) {
      throw new Error(`Embedding with id '${id}' already exists.`);
    }

    if (!Array.isArray(vector) || vector.length === 0 || vector.some(isNaN)) {
      throw new Error('Invalid vector. Must be a non-empty array of numbers.');
    }

    this.store.set(id, vector);
  }

  /**
   * Finds the most similar embedding in the store to the given vector.
   * @param {number[]} queryVector - The query vector.
   * @returns {{id: string, similarity: number} | null} - The most similar embedding's id and similarity score, or null if store is empty.
   * @throws {Error} - Throws if the query vector is invalid.
   */
  findMostSimilar(queryVector) {
    if (!Array.isArray(queryVector) || queryVector.length === 0 || queryVector.some(isNaN)) {
      throw new Error('Invalid query vector. Must be a non-empty array of numbers.');
    }

    let bestMatch = null;
    let highestSimilarity = -Infinity;

    for (const [id, vector] of this.store.entries()) {
      const similarity = cosineSimilarity(queryVector, vector);

      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = { id, similarity };
      }
    }

    return bestMatch;
  }

  /**
   * Removes an embedding from the store.
   * @param {string} id - The id of the embedding to remove.
   * @returns {boolean} - True if the embedding was removed, false if not found.
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

export { cosineSimilarity, EmbeddingMemoryStore };