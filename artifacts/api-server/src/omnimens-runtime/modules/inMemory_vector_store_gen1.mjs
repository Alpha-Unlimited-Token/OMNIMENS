/**
 * @module inMemory_vector_store
 * @description Stores embeddings in memory and provides fast similarity searches using cosine similarity.
 */

/**
 * A class to store and search embeddings in memory using cosine similarity.
 */
export class InMemoryVectorStore {
  /**
   * Initializes the vector store.
   * @constructor
   */
  constructor() {
    /**
     * @private
     * @type {Map<string, number[]>}
     * A Map to store embeddings with unique keys.
     */
    this.store = new Map();
  }

  /**
   * Adds an embedding to the store.
   * @param {string} key - The unique identifier for the embedding.
   * @param {number[]} vector - The embedding vector.
   * @throws {Error} If the vector is not an array of numbers.
   */
  addEmbedding(key, vector) {
    if (!Array.isArray(vector) || !vector.every((v) => typeof v === 'number')) {
      throw new Error('Vector must be an array of numbers.');
    }
    this.store.set(key, vector);
  }

  /**
   * Computes the cosine similarity between two vectors.
   * @private
   * @param {number[]} vectorA - The first vector.
   * @param {number[]} vectorB - The second vector.
   * @returns {number} The cosine similarity between the two vectors.
   */
  _cosineSimilarity(vectorA, vectorB) {
    const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a ** 2, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b ** 2, 0));
    return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
  }

  /**
   * Searches for the most similar embeddings to a given query vector.
   * @param {number[]} queryVector - The query vector.
   * @param {number} topK - The number of top results to return.
   * @returns {Array<{key: string, similarity: number}>} An array of topK results sorted by similarity.
   * @throws {Error} If the query vector is not an array of numbers.
   */
  search(queryVector, topK = 5) {
    if (!Array.isArray(queryVector) || !queryVector.every((v) => typeof v === 'number')) {
      throw new Error('Query vector must be an array of numbers.');
    }

    const results = [];

    for (const [key, vector] of this.store.entries()) {
      const similarity = this._cosineSimilarity(queryVector, vector);
      results.push({ key, similarity });
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Clears all embeddings from the store.
   */
  clear() {
    this.store.clear();
  }
}

/**
 * Example usage:
 * const vectorStore = new InMemoryVectorStore();
 * vectorStore.addEmbedding('item1', [0.1, 0.2, 0.3]);
 * vectorStore.addEmbedding('item2', [0.4, 0.5, 0.6]);
 * const results = vectorStore.search([0.1, 0.2, 0.3]);
 * console.log(results);
 */