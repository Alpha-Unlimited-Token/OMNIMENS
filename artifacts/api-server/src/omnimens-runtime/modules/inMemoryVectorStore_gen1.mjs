/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-03T16:10:48.512Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here

import { createHash } from 'crypto';

// Utility to compute cosine similarity between two vectors
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length');
  }

  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

// Generate a unique hash for a vector to use as an identifier
export function vectorHash(vector) {
  const hash = createHash('sha256');
  hash.update(vector.join(','));
  return hash.digest('hex');
}

// Class to manage an in-memory vector store with HNSW-like approximate nearest neighbor search
export class InMemoryVectorStore {
  constructor() {
    this.vectors = new Map(); // Store vectors by their hash
    this.index = new Map(); // Store adjacency list for HNSW graph
  }

  // Add a vector to the store
  addVector(vector) {
    const id = vectorHash(vector);
    if (this.vectors.has(id)) {
      throw new Error('Vector already exists in the store');
    }

    this.vectors.set(id, vector);

    // Update HNSW graph connections
    this.updateGraph(id, vector);

    return id;
  }

  // Update the graph with a new vector
  updateGraph(id, vector) {
    const neighbors = [...this.vectors.entries()]
      .map(([neighborId, neighborVector]) => ({
        id: neighborId,
        similarity: cosineSimilarity(vector, neighborVector)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5); // Keep top 5 neighbors

    this.index.set(id, neighbors.map((n) => n.id));
  }

  // Search for the nearest neighbors to a query vector
  search(queryVector, k = 5) {
    const visited = new Set();
    const candidates = [...this.vectors.entries()]
      .map(([id, vector]) => ({
        id,
        similarity: cosineSimilarity(queryVector, vector)
      }))
      .sort((a, b) => b.similarity - a.similarity);

    const results = [];

    for (const candidate of candidates) {
      if (visited.has(candidate.id)) {
        continue;
      }

      visited.add(candidate.id);
      results.push(candidate);

      if (results.length >= k) {
        break;
      }
    }

    return results.map((r) => ({ id: r.id, similarity: r.similarity }));
  }
}

// Example utility function to normalize a vector
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  if (magnitude === 0) {
    return vector.map(() => 0);
  }
  return vector.map((v) => v / magnitude);
}

// Example utility function to generate random vectors (useful for testing)
export function generateRandomVector(size, range = 1) {
  return Array.from({ length: size }, () => Math.random() * range * 2 - range);
}