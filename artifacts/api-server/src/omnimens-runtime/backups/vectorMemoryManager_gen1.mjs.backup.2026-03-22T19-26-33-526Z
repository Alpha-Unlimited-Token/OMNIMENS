/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: vectorMemoryManager
 * Written: 2026-03-22T10:37:06.547Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// vectorMemoryManager.js

/**
 * @module vectorMemoryManager
 * @description Provides functionality to store, retrieve, and search embeddings using an approximate nearest neighbor search algorithm.
 */

/**
 * @typedef {Object} Vector
 * @property {string} id - Unique identifier for the vector.
 * @property {number[]} embedding - Numerical array representing the vector.
 */

/**
 * @typedef {Object} SearchResult
 * @property {string} id - Unique identifier of the closest vector.
 * @property {number} distance - Distance to the queried vector.
 */

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Euclidean distance.
 */
function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same dimensions.");
  }
  return Math.sqrt(vectorA.reduce((sum, val, index) => sum + Math.pow(val - vectorB[index], 2), 0));
}

/**
 * Class representing a memory manager for storing and searching vectors.
 */
class VectorMemoryManager {
  constructor() {
    /** @type {Vector[]} */
    this.vectors = [];
  }

  /**
   * Adds a vector to the memory.
   * @param {Vector} vector - The vector to add.
   */
  addVector(vector) {
    if (!Array.isArray(vector.embedding) || typeof vector.id !== "string") {
      throw new Error("Invalid vector format. Must include 'id' (string) and 'embedding' (array).");
    }
    this.vectors.push(vector);
  }

  /**
   * Searches for the nearest vector to the given embedding.
   * @param {number[]} queryEmbedding - The embedding to search for.
   * @returns {SearchResult} - The nearest vector and its distance.
   */
  searchNearest(queryEmbedding) {
    if (!Array.isArray(queryEmbedding)) {
      throw new Error("Query embedding must be an array.");
    }

    let nearestVector = null;
    let nearestDistance = Infinity;

    for (const vector of this.vectors) {
      const distance = euclideanDistance(queryEmbedding, vector.embedding);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestVector = vector;
      }
    }

    if (!nearestVector) {
      throw new Error("No vectors in memory to search.");
    }

    return {
      id: nearestVector.id,
      distance: nearestDistance
    };
  }

  /**
   * Clears all stored vectors.
   */
  clearMemory() {
    this.vectors = [];
  }
}

/**
 * Factory function to create a new VectorMemoryManager instance.
 * @returns {VectorMemoryManager} - A new instance of VectorMemoryManager.
 */
function createVectorMemoryManager() {
  return new VectorMemoryManager();
}

export { createVectorMemoryManager, euclideanDistance };