/**
 * @module vectorMemoryStore
 * @description A utility module for storing and retrieving high-dimensional embeddings
 *              using cosine similarity or approximate nearest neighbor (ANN) search.
 */

/**
 * Stores high-dimensional embeddings and provides efficient retrieval based on semantic similarity.
 * @class VectorMemoryStore
 */
class VectorMemoryStore {
  /**
   * Initializes the store with an empty memory map.
   */
  constructor() {
    this.memory = new Map();
  }

  /**
   * Adds a vector to the memory store.
   * @param {string} key - Unique identifier for the vector.
   * @param {Array<number>} vector - High-dimensional embedding to store.
   * @throws {Error} Throws if the vector is not an array of numbers.
   */
  addVector(key, vector) {
    if (!Array.isArray(vector) || !vector.every((v) => typeof v === 'number')) {
      throw new Error('Vector must be an array of numbers.');
    }
    this.memory.set(key, vector);
  }

  /**
   * Computes the cosine similarity between two vectors.
   * @private
   * @param {Array<number>} vectorA - First vector.
   * @param {Array<number>} vectorB - Second vector.
   * @returns {number} Cosine similarity score.
   */
  _cosineSimilarity(vectorA, vectorB) {
    const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a ** 2, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b ** 2, 0));

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0; // Avoid division by zero.
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Finds the most similar vector in the memory store to the given query vector.
   * @param {Array<number>} queryVector - The vector to compare against the stored vectors.
   * @returns {Object} The most similar vector's key and similarity score.
   * @throws {Error} Throws if the query vector is not an array of numbers.
   */
  findMostSimilar(queryVector) {
    if (!Array.isArray(queryVector) || !queryVector.every((v) => typeof v === 'number')) {
      throw new Error('Query vector must be an array of numbers.');
    }

    let bestMatch = null;
    let highestSimilarity = -Infinity;

    for (const [key, storedVector] of this.memory.entries()) {
      const similarity = this._cosineSimilarity(queryVector, storedVector);
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = key;
      }
    }

    return { key: bestMatch, similarity: highestSimilarity };
  }

  /**
   * Clears all vectors from the memory store.
   */
  clearMemory() {
    this.memory.clear();
  }
}

/**
 * Example usage:
 * const store = new VectorMemoryStore();
 * store.addVector('vector1', [0.1, 0.2, 0.3]);
 * store.addVector('vector2', [0.4, 0.5, 0.6]);
 * const result = store.findMostSimilar([0.1, 0.2, 0.3]);
 * console.log(result); // { key: 'vector1', similarity: 1 }
 */

module.exports = VectorMemoryStore;