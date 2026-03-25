/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: embeddingMemoryManager
 * Purpose: Store and retrieve high-dimensional embeddings for semantic search and long-term memory recall.
 * Description: An in-memory vector store for storing, searching, and managing high-dimensional embeddings with approximate nearest neighbor search for OMNIMENS's intelligence.
 * Migrated: 2026-03-25T22:49:34.266Z
 */

/**
 * @module embeddingMemoryManager
 * @description A utility module for storing and retrieving high-dimensional embeddings using an in-memory vector store with approximate nearest neighbor search.
 * @author OMNIMENS
 */

/**
 * Represents an in-memory vector store for high-dimensional embeddings.
 * Provides methods for adding vectors, searching for nearest neighbors, and managing memory.
 */
class EmbeddingMemoryManager {
  constructor() {
    /**
     * @private
     * @type {Map<string, number[]>}
     * Stores embeddings with unique string keys.
     */
    this.embeddingStore = new Map();
  }

  /**
   * Adds a new embedding to the store.
   * @param {string} key - A unique identifier for the embedding.
   * @param {number[]} vector - The high-dimensional vector to store.
   * @throws {Error} If the key already exists or the vector is invalid.
   */
  addEmbedding(key, vector) {
    if (this.embeddingStore.has(key)) {
      throw new Error(`Key '${key}' already exists in the store.`);
    }
    if (!Array.isArray(vector) || vector.some((v) => typeof v !== 'number')) {
      throw new Error('Vector must be an array of numbers.');
    }
    this.embeddingStore.set(key, vector);
  }

  /**
   * Searches for the nearest neighbors to a given query vector.
   * Uses Euclidean distance for similarity measurement.
   * @param {number[]} queryVector - The query vector to search for.
   * @param {number} k - The number of nearest neighbors to retrieve.
   * @returns {Array<{ key: string, distance: number }>} An array of nearest neighbors with their keys and distances.
   * @throws {Error} If the query vector is invalid or k is not a positive integer.
   */
  searchNearestNeighbors(queryVector, k) {
    if (!Array.isArray(queryVector) || queryVector.some((v) => typeof v !== 'number')) {
      throw new Error('Query vector must be an array of numbers.');
    }
    if (typeof k !== 'number' || k <= 0 || !Number.isInteger(k)) {
      throw new Error('k must be a positive integer.');
    }

    const distances = [];

    for (const [key, vector] of this.embeddingStore.entries()) {
      if (vector.length !== queryVector.length) {
        throw new Error(`Vector dimensions mismatch for key '${key}'.`);
      }

      const distance = Math.sqrt(
        vector.reduce((sum, value, index) => sum + Math.pow(value - queryVector[index], 2), 0)
      );

      distances.push({ key, distance });
    }

    return distances
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k);
  }

  /**
   * Removes an embedding from the store by its key.
   * @param {string} key - The unique identifier of the embedding to remove.
   * @returns {boolean} True if the key existed and was removed, false otherwise.
   */
  removeEmbedding(key) {
    return this.embeddingStore.delete(key);
  }

  /**
   * Clears all embeddings from the store.
   */
  clearStore() {
    this.embeddingStore.clear();
  }

  /**
   * Gets the total number of embeddings in the store.
   * @returns {number} The number of stored embeddings.
   */
  getEmbeddingCount() {
    return this.embeddingStore.size;
  }
}

/**
 * Factory function to create a new instance of EmbeddingMemoryManager.
 * @returns {EmbeddingMemoryManager} A new instance of the manager.
 */
export function createEmbeddingMemoryManager() {
  return new EmbeddingMemoryManager();
}

/**
 * Utility function to compute the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} The cosine similarity between the two vectors.
 * @throws {Error} If the vectors are invalid or have mismatched dimensions.
 */
export function computeCosineSimilarity(vectorA, vectorB) {
  if (!Array.isArray(vectorA) || !Array.isArray(vectorB)) {
    throw new Error('Both inputs must be arrays.');
  }
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions.');
  }

  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error('Vectors must not be zero vectors.');
  }

  return dotProduct / (magnitudeA * magnitudeB);
}
