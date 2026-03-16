/**
 * @module semanticMemoryStore
 * @description A utility module for storing and retrieving semantic embeddings using in-memory approximate nearest neighbor (ANN) search.
 */

/**
 * Represents a semantic memory store using HNSW-like graph-based ANN search.
 */
class SemanticMemoryStore {
  constructor() {
    /**
     * @type {Map<number, {id: string, vector: number[]}>}
     * Internal storage for embeddings, keyed by unique numeric IDs.
     */
    this.store = new Map();

    /**
     * @type {Map<number, Set<number>>}
     * Graph-based adjacency list for approximate nearest neighbor search.
     */
    this.graph = new Map();

    /**
     * @type {number}
     * Counter for generating unique numeric IDs for embeddings.
     */
    this.idCounter = 0;
  }

  /**
   * Adds a new embedding to the store.
   * @param {string} id - A unique identifier for the embedding.
   * @param {number[]} vector - The embedding vector to store.
   * @throws {Error} If the vector is not a valid numeric array.
   */
  addEmbedding(id, vector) {
    if (!Array.isArray(vector) || vector.some((v) => typeof v !== 'number')) {
      throw new Error('Vector must be an array of numbers.');
    }

    const newId = this.idCounter++;
    this.store.set(newId, { id, vector });

    // Update graph connections (basic HNSW-like graph construction)
    this.graph.set(newId, new Set());
    for (const [existingId, { vector: existingVector }] of this.store.entries()) {
      if (existingId === newId) continue;
      const similarity = this._cosineSimilarity(vector, existingVector);

      // Connect nodes if similarity exceeds a threshold (e.g., 0.8)
      if (similarity > 0.8) {
        this.graph.get(newId).add(existingId);
        this.graph.get(existingId).add(newId);
      }
    }
  }

  /**
   * Finds the most similar embeddings to a given query vector.
   * @param {number[]} queryVector - The query vector for similarity search.
   * @param {number} k - The number of nearest neighbors to return.
   * @returns {Array<{id: string, similarity: number}>} The top-k most similar embeddings.
   * @throws {Error} If the query vector is not a valid numeric array.
   */
  findNearestNeighbors(queryVector, k) {
    if (!Array.isArray(queryVector) || queryVector.some((v) => typeof v !== 'number')) {
      throw new Error('Query vector must be an array of numbers.');
    }

    const visited = new Set();
    const candidates = [...this.store.keys()];
    const results = [];

    // Perform a graph traversal to find nearest neighbors
    while (candidates.length > 0) {
      const currentId = candidates.pop();
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const { id, vector } = this.store.get(currentId);
      const similarity = this._cosineSimilarity(queryVector, vector);

      results.push({ id, similarity });
      results.sort((a, b) => b.similarity - a.similarity);
      if (results.length > k) results.pop();

      // Add neighbors to candidates
      for (const neighbor of this.graph.get(currentId)) {
        if (!visited.has(neighbor)) {
          candidates.push(neighbor);
        }
      }
    }

    return results;
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
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB || 1);
  }
}

/**
 * Creates a new semantic memory store instance.
 * @returns {SemanticMemoryStore} A new instance of the semantic memory store.
 */
export function createSemanticMemoryStore() {
  return new SemanticMemoryStore();
}