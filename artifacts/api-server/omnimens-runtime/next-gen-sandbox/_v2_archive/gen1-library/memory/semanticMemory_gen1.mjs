/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: semanticMemory
 * Purpose: Simulate in-memory vector storage for contextual memory within a session.
 * Description: Simulates in-memory vector storage and retrieval for contextual memory using cosine similarity, enabling OMNIMENS to enhance session intelligence.
 * Migrated: 2026-03-25T22:49:34.172Z
 */

/**
 * @module semanticMemory
 * @description This module provides an in-memory vector storage and retrieval system
 * for contextual memory using cosine similarity on precomputed embeddings.
 */

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} Cosine similarity value between -1 and 1.
 */
function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must be of the same length.");
  }

  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero; return zero similarity for zero vectors.
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Class representing a semantic memory store.
 */
class SemanticMemory {
  constructor() {
    /**
     * @private
     * @type {Map<string, number[]>}
     * A Map to store embeddings with their associated keys.
     */
    this.memory = new Map();
  }

  /**
   * Adds a new key-vector pair to the memory.
   * @param {string} key - The unique identifier for the embedding.
   * @param {number[]} vector - The embedding vector to store.
   */
  add(key, vector) {
    if (this.memory.has(key)) {
      throw new Error(`Key '${key}' already exists in memory.`);
    }
    this.memory.set(key, vector);
  }

  /**
   * Retrieves the vector associated with a given key.
   * @param {string} key - The unique identifier for the embedding.
   * @returns {number[] | undefined} The associated vector, or undefined if not found.
   */
  get(key) {
    return this.memory.get(key);
  }

  /**
   * Finds the most similar vector in memory to a given query vector.
   * @param {number[]} queryVector - The query vector.
   * @returns {{ key: string, similarity: number } | null} The key and similarity of the closest match, or null if memory is empty.
   */
  findMostSimilar(queryVector) {
    let bestMatch = null;
    let highestSimilarity = -Infinity;

    for (const [key, vector] of this.memory.entries()) {
      const similarity = cosineSimilarity(queryVector, vector);
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = { key, similarity };
      }
    }

    return bestMatch;
  }

  /**
   * Clears all stored embeddings from memory.
   */
  clear() {
    this.memory.clear();
  }
}

export { SemanticMemory, cosineSimilarity };