/**
 * @module vectorStore
 * @description Implements an in-memory approximate nearest neighbor search for semantic similarity using HNSW or brute-force cosine similarity.
 */

/**
 * VectorStore class for managing and querying high-dimensional vectors.
 */
export class VectorStore {
  /**
   * Initializes the VectorStore.
   * @param {boolean} [useHNSW=false] - Whether to use HNSW for approximate nearest neighbor search. Defaults to brute-force.
   */
  constructor(useHNSW = false) {
    this.vectors = []; // Array to store vectors and their metadata
    this.useHNSW = useHNSW; // Flag to determine algorithm
    if (useHNSW) {
      this.hnswGraph = new Map(); // HNSW graph representation
    }
  }

  /**
   * Adds a vector to the store.
   * @param {Array<number>} vector - The vector to store.
   * @param {string} id - A unique identifier for the vector.
   */
  addVector(vector, id) {
    if (!Array.isArray(vector) || vector.some(isNaN)) {
      throw new Error("Vector must be an array of numbers.");
    }
    this.vectors.push({ vector, id });
    if (this.useHNSW) {
      this._addToHNSW(vector, id);
    }
  }

  /**
   * Finds the nearest neighbors to a given query vector.
   * @param {Array<number>} queryVector - The vector to query.
   * @param {number} k - The number of nearest neighbors to return.
   * @returns {Array<{id: string, similarity: number}>} - List of nearest neighbors with their similarity scores.
   */
  findNearest(queryVector, k) {
    if (!Array.isArray(queryVector) || queryVector.some(isNaN)) {
      throw new Error("Query vector must be an array of numbers.");
    }
    if (this.useHNSW) {
      return this._hnswSearch(queryVector, k);
    } else {
      return this._bruteForceSearch(queryVector, k);
    }
  }

  /**
   * Brute-force search implementation.
   * @private
   * @param {Array<number>} queryVector - The vector to query.
   * @param {number} k - The number of nearest neighbors to return.
   * @returns {Array<{id: string, similarity: number}>}
   */
  _bruteForceSearch(queryVector, k) {
    const results = this.vectors.map(({ vector, id }) => {
      const similarity = this._cosineSimilarity(queryVector, vector);
      return { id, similarity };
    });
    return results.sort((a, b) => b.similarity - a.similarity).slice(0, k);
  }

  /**
   * Adds a vector to the HNSW graph.
   * @private
   * @param {Array<number>} vector - The vector to add.
   * @param {string} id - The unique identifier for the vector.
   */
  _addToHNSW(vector, id) {
    // Simplified HNSW insertion logic for demonstration purposes
    this.hnswGraph.set(id, vector);
  }

  /**
   * HNSW search implementation.
   * @private
   * @param {Array<number>} queryVector - The vector to query.
   * @param {number} k - The number of nearest neighbors to return.
   * @returns {Array<{id: string, similarity: number}>}
   */
  _hnswSearch(queryVector, k) {
    // Simplified HNSW search logic for demonstration purposes
    const results = [];
    for (const [id, vector] of this.hnswGraph) {
      const similarity = this._cosineSimilarity(queryVector, vector);
      results.push({ id, similarity });
    }
    return results.sort((a, b) => b.similarity - a.similarity).slice(0, k);
  }

  /**
   * Computes the cosine similarity between two vectors.
   * @private
   * @param {Array<number>} vecA - The first vector.
   * @param {Array<number>} vecB - The second vector.
   * @returns {number} - The cosine similarity between the two vectors.
   */
  _cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}

/**
 * Utility function to normalize a vector.
 * @param {Array<number>} vector - The vector to normalize.
 * @returns {Array<number>} - The normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map((val) => val / magnitude);
}

/**
 * Utility function to compute pairwise cosine similarities between vectors.
 * @param {Array<Array<number>>} vectors - List of vectors.
 * @returns {Array<{pair: [string, string], similarity: number}>} - Pairwise similarities.
 */
export function pairwiseSimilarities(vectors) {
  const results = [];
  for (let i = 0; i < vectors.length; i++) {
    for (let j = i + 1; j < vectors.length; j++) {
      const similarity = new VectorStore()._cosineSimilarity(vectors[i].vector, vectors[j].vector);
      results.push({ pair: [vectors[i].id, vectors[j].id], similarity });
    }
  }
  return results;
}