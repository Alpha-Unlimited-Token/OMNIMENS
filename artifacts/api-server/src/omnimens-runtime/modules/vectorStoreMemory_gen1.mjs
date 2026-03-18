// vectorStoreMemory.js

/**
 * @module vectorStoreMemory
 * @description This module provides an in-memory embedding index optimized for fast cosine similarity queries.
 * It enables OMNIMENS to dynamically adapt to new embeddings and retrieve relevant vectors efficiently.
 */

/**
 * Calculates the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The cosine similarity score (-1 to 1).
 */
function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must be of the same length.");
  }

  const dotProduct = vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Class representing an in-memory vector store.
 */
class VectorStore {
  constructor() {
    /**
     * @type {Map<string, number[]>}
     * @description Stores embeddings as key-value pairs (id -> embedding).
     */
    this.store = new Map();
  }

  /**
   * Adds a vector to the store.
   * @param {string} id - The unique identifier for the vector.
   * @param {number[]} vector - The embedding vector.
   */
  addVector(id, vector) {
    if (this.store.has(id)) {
      throw new Error(`Vector with id '${id}' already exists.`);
    }
    this.store.set(id, vector);
  }

  /**
   * Removes a vector from the store.
   * @param {string} id - The unique identifier for the vector.
   */
  removeVector(id) {
    if (!this.store.has(id)) {
      throw new Error(`Vector with id '${id}' does not exist.`);
    }
    this.store.delete(id);
  }

  /**
   * Finds the top N most similar vectors to a given query vector.
   * @param {number[]} queryVector - The query embedding vector.
   * @param {number} topN - The number of top matches to retrieve.
   * @returns {Array<{id: string, similarity: number}>} - Array of top N matches sorted by similarity.
   */
  findMostSimilar(queryVector, topN = 1) {
    if (topN <= 0) {
      throw new Error("topN must be greater than 0.");
    }

    const similarities = [];

    for (const [id, vector] of this.store.entries()) {
      const similarity = cosineSimilarity(queryVector, vector);
      similarities.push({ id, similarity });
    }

    similarities.sort((a, b) => b.similarity - a.similarity);

    return similarities.slice(0, topN);
  }
}

/**
 * Exports the VectorStore class and cosineSimilarity function.
 */
export { VectorStore, cosineSimilarity };