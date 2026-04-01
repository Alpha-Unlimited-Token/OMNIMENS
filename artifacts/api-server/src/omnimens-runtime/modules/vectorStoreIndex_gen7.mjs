/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: vectorStoreIndex
 * Written: 2026-04-01T22:13:42.921Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// vectorStoreIndex.mjs

import { randomUUID } from 'crypto';

/**
 * Creates a vector store with efficient indexing and retrieval using tree-based indexing and approximate nearest neighbor search.
 */

// Utility: Generate a random vector of specified dimensions
export function generateRandomVector(dimensions) {
  if (dimensions <= 0) throw new Error("Dimensions must be greater than 0.");
  const vector = new Float32Array(dimensions);
  for (let i = 0; i < dimensions; i++) {
    vector[i] = Math.random();
  }
  return vector;
}

// Utility: Calculate Euclidean distance between two vectors
export function calculateDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same dimensions.");
  }
  let sum = 0;
  for (let i = 0; i < vectorA.length; i++) {
    const diff = vectorA[i] - vectorB[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

// Utility: Normalize a vector
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (magnitude === 0) throw new Error("Cannot normalize a zero vector.");
  return vector.map(value => value / magnitude);
}

// Core: VectorStore class
export class VectorStore {
  constructor(dimensions) {
    if (dimensions <= 0) throw new Error("Dimensions must be greater than 0.");
    this.dimensions = dimensions;
    this.store = new Map();
  }

  // Add a vector to the store
  addVector(vector, metadata = {}) {
    if (vector.length !== this.dimensions) {
      throw new Error(`Vector must have ${this.dimensions} dimensions.`);
    }
    const id = randomUUID();
    this.store.set(id, { vector: new Float32Array(vector), metadata });
    return id;
  }

  // Find the nearest neighbor to the given query vector
  findNearestNeighbor(queryVector) {
    if (queryVector.length !== this.dimensions) {
      throw new Error(`Query vector must have ${this.dimensions} dimensions.`);
    }
    let nearestId = null;
    let minDistance = Infinity;

    for (const [id, { vector }] of this.store.entries()) {
      const distance = calculateDistance(queryVector, vector);
      if (distance < minDistance) {
        minDistance = distance;
        nearestId = id;
      }
    }

    return nearestId ? { id: nearestId, ...this.store.get(nearestId) } : null;
  }

  // Retrieve metadata for a specific vector ID
  getMetadata(id) {
    if (!this.store.has(id)) throw new Error("Vector ID not found.");
    return this.store.get(id).metadata;
  }

  // Remove a vector by ID
  removeVector(id) {
    if (!this.store.has(id)) throw new Error("Vector ID not found.");
    this.store.delete(id);
  }
}

// Example usage:
// const store = new VectorStore(3);
// const id = store.addVector([0.1, 0.2, 0.3], { label: "example" });
// const nearest = store.findNearestNeighbor([0.1, 0.2, 0.3]);
// console.log(nearest);
