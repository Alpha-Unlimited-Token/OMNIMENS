/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-01T22:13:19.655Z
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
import { randomFillSync } from 'crypto';

/**
 * Generates a random unit vector of the given dimension.
 * @param {number} dim - The dimensionality of the vector.
 * @returns {Float32Array} A normalized random vector.
 */
export function generateRandomUnitVector(dim) {
  const vector = new Float32Array(dim);
  randomFillSync(vector);
  let magnitude = 0;
  for (let i = 0; i < dim; i++) {
    magnitude += vector[i] * vector[i];
  }
  magnitude = Math.sqrt(magnitude);
  for (let i = 0; i < dim; i++) {
    vector[i] /= magnitude;
  }
  return vector;
}

/**
 * Computes the Euclidean distance between two vectors.
 * @param {Float32Array} vec1 - The first vector.
 * @param {Float32Array} vec2 - The second vector.
 * @returns {number} The Euclidean distance.
 */
export function euclideanDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same dimension.');
  }
  let sum = 0;
  for (let i = 0; i < vec1.length; i++) {
    const diff = vec1[i] - vec2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * In-memory vector store for fast similarity search using naive linear scan.
 * @class
 */
export class InMemoryVectorStore {
  constructor(dim) {
    if (!Number.isInteger(dim) || dim <= 0) {
      throw new Error('Dimension must be a positive integer.');
    }
    this.dim = dim;
    this.vectors = [];
    this.metadata = [];
  }

  /**
   * Adds a vector and its associated metadata to the store.
   * @param {Float32Array} vector - The vector to add.
   * @param {any} meta - Metadata associated with the vector.
   */
  add(vector, meta) {
    if (!(vector instanceof Float32Array) || vector.length !== this.dim) {
      throw new Error(`Vector must be a Float32Array of dimension ${this.dim}.`);
    }
    this.vectors.push(vector);
    this.metadata.push(meta);
  }

  /**
   * Finds the nearest neighbors to a given query vector.
   * @param {Float32Array} query - The query vector.
   * @param {number} k - The number of nearest neighbors to retrieve.
   * @returns {Array<{ vector, meta, distance}>} An array of nearest neighbors.
   */
  search(query, k) {
    if (!(query instanceof Float32Array) || query.length !== this.dim) {
      throw new Error(`Query must be a Float32Array of dimension ${this.dim}.`);
    }
    if (!Number.isInteger(k) || k <= 0) {
      throw new Error('k must be a positive integer.');
    }

    const results = [];
    for (let i = 0; i < this.vectors.length; i++) {
      const distance = euclideanDistance(query, this.vectors[i]);
      results.push({ vector: this.vectors[i], meta: this.metadata[i], distance });
    }

    results.sort((a, b) => a.distance - b.distance);
    return results.slice(0, k);
  }
}

/**
 * Utility function to normalize a vector.
 * @param {Float32Array} vector - The vector to normalize.
 * @returns {Float32Array} A normalized vector.
 */
export function normalizeVector(vector) {
  let magnitude = 0;
  for (let i = 0; i < vector.length; i++) {
    magnitude += vector[i] * vector[i];
  }
  magnitude = Math.sqrt(magnitude);
  const normalized = new Float32Array(vector.length);
  for (let i = 0; i < vector.length; i++) {
    normalized[i] = vector[i] / magnitude;
  }
  return normalized;
}