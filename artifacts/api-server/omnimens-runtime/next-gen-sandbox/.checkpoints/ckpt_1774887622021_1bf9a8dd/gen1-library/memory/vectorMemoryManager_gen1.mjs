/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: vectorMemoryManager
 * Purpose: Provide fast in-memory storage and retrieval of embeddings for dynamic memory recall.
 * Description: Manages in-memory storage and retrieval of embeddings for fast and intelligent dynamic memory recall using cosine similarity.
 * Migrated: 2026-03-25T22:49:34.169Z
 */

// Complete ES module code here, starting with /** JSDoc */ and exports

/**
 * @module vectorMemoryManager
 * @description Provides fast in-memory storage and retrieval of embeddings for dynamic memory recall.
 * Implements efficient indexing and retrieval using pure JavaScript data structures.
 */

/**
 * @typedef {number[]} Vector
 * A numerical array representing an embedding.
 */

/**
 * @typedef {Object} IndexedVector
 * @property {string} id - Unique identifier for the vector.
 * @property {Vector} vector - The embedding vector.
 */

/**
 * @typedef {Object} SearchResult
 * @property {string} id - Unique identifier of the closest vector.
 * @property {number} similarity - Cosine similarity score.
 */

/**
 * Computes the cosine similarity between two vectors.
 * @param {Vector} vectorA - First vector.
 * @param {Vector} vectorB - Second vector.
 * @returns {number} Cosine similarity score.
 */
function cosineSimilarity(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, value, index) => sum + value * vectorB[index], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, value) => sum + value ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, value) => sum + value ** 2, 0));
  return magnitudeA > 0 && magnitudeB > 0 ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Class for managing vector embeddings in memory.
 */
class VectorMemoryManager {
  constructor() {
    /** @type {Map<string, IndexedVector>} */
    this.vectorStore = new Map();
  }

  /**
   * Adds a vector to the store.
   * @param {string} id - Unique identifier for the vector.
   * @param {Vector} vector - The embedding vector.
   * @throws {Error} If the vector is not valid.
   */
  addVector(id, vector) {
    if (!Array.isArray(vector) || vector.some(value => typeof value !== 'number')) {
      throw new Error('Invalid vector: must be an array of numbers.');
    }
    this.vectorStore.set(id, { id, vector });
  }

  /**
   * Retrieves a vector by its ID.
   * @param {string} id - Unique identifier of the vector.
   * @returns {Vector|null} The vector, or null if not found.
   */
  getVectorById(id) {
    const entry = this.vectorStore.get(id);
    return entry ? entry.vector : null;
  }

  /**
   * Finds the most similar vector in the store to the given query vector.
   * @param {Vector} queryVector - The query embedding vector.
   * @returns {SearchResult|null} The closest vector and similarity score, or null if store is empty.
   */
  findMostSimilarVector(queryVector) {
    if (this.vectorStore.size === 0) return null;

    let bestMatch = null;
    let highestSimilarity = -Infinity;

    for (const { id, vector } of this.vectorStore.values()) {
      const similarity = cosineSimilarity(queryVector, vector);
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = { id, similarity };
      }
    }

    return bestMatch;
  }

  /**
   * Clears all vectors from the store.
   */
  clearStore() {
    this.vectorStore.clear();
  }
}

// Export the module
export { VectorMemoryManager, cosineSimilarity };