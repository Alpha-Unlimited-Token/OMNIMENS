/**
 * semanticMemoryCache.js
 * Provides fast in-memory retrieval of embeddings using approximate nearest neighbor search (HNSW-like implementation).
 * This module is designed for OMNIMENS to efficiently retrieve semantically similar embeddings for context-aware responses.
 */

/**
 * Node.js built-in module for performance timing.
 */
const { performance } = require('perf_hooks');

/**
 * Class representing a semantic memory cache with HNSW-like approximate nearest neighbor search.
 */
class SemanticMemoryCache {
  constructor(maxNodes = 1000, dimensions = 128) {
    this.maxNodes = maxNodes; // Maximum number of embeddings to store
    this.dimensions = dimensions; // Dimensionality of embeddings
    this.nodes = []; // Array to store embeddings and metadata
    this.graph = new Map(); // Adjacency list for HNSW graph
  }

  /**
   * Adds a new embedding to the cache.
   * @param {number[]} embedding - The embedding vector.
   * @param {string} metadata - Metadata associated with the embedding.
   */
  add(embedding, metadata) {
    if (embedding.length !== this.dimensions) {
      throw new Error(`Embedding must have ${this.dimensions} dimensions.`);
    }

    if (this.nodes.length >= this.maxNodes) {
      throw new Error('Memory cache is full. Consider removing old embeddings.');
    }

    const nodeId = this.nodes.length;
    this.nodes.push({ embedding, metadata });

    // Connect the new node to its nearest neighbors in the graph
    const neighbors = this._findNearestNeighbors(embedding, 5); // Connect to 5 nearest neighbors
    this.graph.set(nodeId, neighbors.map((n) => n.id));
  }

  /**
   * Searches for the k most similar embeddings to the query.
   * @param {number[]} query - The query embedding vector.
   * @param {number} k - Number of nearest neighbors to retrieve.
   * @returns {Array<{metadata: string, similarity: number}>} - Array of metadata and similarity scores.
   */
  search(query, k = 5) {
    if (query.length !== this.dimensions) {
      throw new Error(`Query must have ${this.dimensions} dimensions.`);
    }

    const visited = new Set();
    const candidates = []; // Priority queue for candidates

    // Start search from a random node
    const startNode = Math.floor(Math.random() * this.nodes.length);
    candidates.push({ id: startNode, similarity: this._cosineSimilarity(query, this.nodes[startNode].embedding) });

    while (candidates.length > 0 && visited.size < k) {
      // Get the most similar node
      const current = candidates.pop();
      if (visited.has(current.id)) continue;

      visited.add(current.id);

      // Add neighbors to the candidate list
      const neighbors = this.graph.get(current.id) || [];
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          const similarity = this._cosineSimilarity(query, this.nodes[neighborId].embedding);
          candidates.push({ id: neighborId, similarity });
        }
      }

      // Sort candidates by similarity (descending)
      candidates.sort((a, b) => b.similarity - a.similarity);
    }

    // Return the top-k results
    return Array.from(visited)
      .slice(0, k)
      .map((id) => ({ metadata: this.nodes[id].metadata, similarity: this._cosineSimilarity(query, this.nodes[id].embedding) }));
  }

  /**
   * Calculates the cosine similarity between two vectors.
   * @param {number[]} a - First vector.
   * @param {number[]} b - Second vector.
   * @returns {number} - Cosine similarity score.
   */
  _cosineSimilarity(a, b) {
    const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Finds the nearest neighbors for a given embedding.
   * @param {number[]} embedding - The query embedding.
   * @param {number} k - Number of neighbors to find.
   * @returns {Array<{id: number, similarity: number}>} - Array of neighbor IDs and similarity scores.
   */
  _findNearestNeighbors(embedding, k) {
    const similarities = this.nodes.map((node, id) => ({
      id,
      similarity: this._cosineSimilarity(embedding, node.embedding),
    }));

    return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, k);
  }
}

/**
 * Exports the SemanticMemoryCache class.
 */
module.exports = {
  SemanticMemoryCache,
};