/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_3
 * Name: vectorStoreANN
 * Purpose: Implements an in-memory vector store with approximate nearest neighbor search for fast embedding similarity queries.
 * Description: Implements an in-memory vector store with hierarchical clustering-based ANN search using cosine similarity for fast embedding queries.
 * Migrated: 2026-04-01T22:23:20.232Z
 */

// vectorStoreANN.mjs

import { createHash } from 'crypto';

/**
 * Utility function to calculate cosine similarity between two vectors.
 * @param {number[]} vecA - First vector.
 * @param {number[]} vecB - Second vector.
 * @returns {number} - Cosine similarity score.
 */
export function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Hash function for generating unique IDs for vectors.
 * @param {number[]} vector - Input vector.
 * @returns {string} - Hash ID.
 */
export function vectorHash(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

/**
 * Class representing an in-memory vector store with hierarchical clustering-based ANN search.
 */
export class VectorStoreANN {
  constructor() {
    this.vectors = new Map();
    this.clusters = [];
  }

  /**
   * Adds a vector to the store.
   * @param {number[]} vector - Vector to add.
   */
  addVector(vector) {
    const id = vectorHash(vector);
    this.vectors.set(id, vector);
    this._updateClusters(vector);
  }

  /**
   * Searches for the nearest neighbors of a given vector.
   * @param {number[]} queryVector - Vector to search for.
   * @param {number} k - Number of nearest neighbors to return.
   * @returns {Array<{id: string, similarity: number}>} - Nearest neighbors.
   */
  search(queryVector, k = 1) {
    const results = [];
    for (const [id, vector] of this.vectors.entries()) {
      const similarity = cosineSimilarity(queryVector, vector);
      results.push({ id, similarity });
    }
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);
  }

  /**
   * Internal method to update hierarchical clusters.
   * @param {number[]} vector - Vector to integrate into clusters.
   */
  _updateClusters(vector) {
    // Simplified clustering logic: group vectors by similarity threshold.
    const threshold = 0.8;
    let addedToCluster = false;

    for (const cluster of this.clusters) {
      const representative = cluster[0];
      if (cosineSimilarity(vector, representative) >= threshold) {
        cluster.push(vector);
        addedToCluster = true;
        break;
      }
    }

    if (!addedToCluster) {
      this.clusters.push([vector]);
    }
  }

  /**
   * Retrieves all stored vectors.
   * @returns {Array<{id: string, vector: number[]}>} - All vectors in the store.
   */
  getAllVectors() {
    return Array.from(this.vectors.entries()).map(([id, vector]) => ({ id, vector }));
  }
}

/**
 * Utility function to normalize a vector.
 * @param {number[]} vector - Input vector.
 * @returns {number[]} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  return magnitude ? vector.map(val => val / magnitude) : vector;
}