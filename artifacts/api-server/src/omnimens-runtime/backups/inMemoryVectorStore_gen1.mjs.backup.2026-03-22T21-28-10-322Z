/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-03-22T21:04:45.277Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * @module inMemoryVectorStore
 * @description A lightweight in-memory k-Nearest Neighbors (k-NN) vector store for fast similarity search of embeddings.
 * This module enables efficient retrieval-augmented generation (RAG) for large language models.
 */

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The Euclidean distance.
 * @throws {Error} - If the vectors have different dimensions.
 */
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same dimensions.");
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
}

/**
 * A class representing an in-memory vector store for fast similarity search.
 */
export class InMemoryVectorStore {
  /**
   * Initializes the vector store.
   */
  constructor() {
    /** @type {{id: string, vector: number[]}[]} */
    this.vectors = [];
  }

  /**
   * Adds a vector to the store.
   * @param {string} id - A unique identifier for the vector.
   * @param {number[]} vector - The vector to store.
   */
  addVector(id, vector) {
    this.vectors.push({ id, vector });
  }

  /**
   * Performs a k-Nearest Neighbors search to find the closest vectors.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - The number of nearest neighbors to retrieve.
   * @returns {{id: string, distance: number}[]} - The k nearest neighbors with their distances.
   */
  search(queryVector, k) {
    if (k <= 0) {
      throw new Error("k must be a positive integer.");
    }

    const distances = this.vectors.map(({ id, vector }) => ({
      id,
      distance: euclideanDistance(queryVector, vector)
    }));

    distances.sort((a, b) => a.distance - b.distance);

    return distances.slice(0, k);
  }

  /**
   * Clears all vectors from the store.
   */
  clear() {
    this.vectors = [];
  }
}

/**
 * Example usage:
 * const store = new InMemoryVectorStore();
 * store.addVector("vec1", [1, 2, 3]);
 * store.addVector("vec2", [4, 5, 6]);
 * const results = store.search([1, 2, 3], 1);
 * console.log(results); // [{ id: "vec1", distance: 0 }]
 */