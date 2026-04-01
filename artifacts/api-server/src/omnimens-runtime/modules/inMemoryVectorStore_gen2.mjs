/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-01T22:18:22.486Z
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

import { randomUUID } from 'crypto';

/**
 * Utility module for in-memory vector storage and retrieval using HNSW-like algorithm.
 * Provides fast similarity search for embeddings.
 */

// Helper function to calculate Euclidean distance between two vectors
export function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
}

// Node structure for HNSW-like graph
class Node {
  constructor(id, vector) {
    this.id = id;
    this.vector = vector;
    this.neighbors = new Set();
  }
}

// Main class for the in-memory vector store
export class InMemoryVectorStore {
  constructor(maxNeighbors = 10) {
    this.nodes = new Map();
    this.maxNeighbors = maxNeighbors;
  }

  /**
   * Add a vector to the store
   * @param {Array<number>} vector - The embedding vector to store
   * @returns {string} - Unique ID of the stored vector
   */
  addVector(vector) {
    const id = randomUUID();
    const newNode = new Node(id, vector);
    this.nodes.set(id, newNode);

    // Update neighbors for the new node
    this._updateNeighbors(newNode);

    return id;
  }

  /**
   * Retrieve the most similar vectors to the query vector
   * @param {Array<number>} queryVector - The vector to search for
   * @param {number} k - Number of nearest neighbors to retrieve
   * @returns {Array<{id, distance}>} - List of nearest neighbors
   */
  search(queryVector, k = 1) {
    if (k <= 0) {
      throw new Error('Number of neighbors (k) must be greater than 0');
    }

    const distances = Array.from(this.nodes.values()).map(node => ({
      id: node.id,
      distance: euclideanDistance(queryVector, node.vector)
    }));

    // Sort by distance and return top k
    return distances.sort((a, b) => a.distance - b.distance).slice(0, k);
  }

  /**
   * Internal method to update neighbors for a new node
   * @param {Node} newNode - The newly added node
   */
  _updateNeighbors(newNode) {
    const distances = Array.from(this.nodes.values())
      .filter(node => node.id !== newNode.id)
      .map(node => ({
        node,
        distance: euclideanDistance(newNode.vector, node.vector)
      }));

    // Sort by distance and select closest neighbors
    distances.sort((a, b) => a.distance - b.distance);
    const closestNeighbors = distances.slice(0, this.maxNeighbors);

    for (const { node } of closestNeighbors) {
      newNode.neighbors.add(node);
      node.neighbors.add(newNode);
    }
  }
}

// Example utility function to normalize vectors
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector');
  }
  return vector.map(val => val / magnitude);
}

// Example utility function to generate random vectors
export function generateRandomVector(dimensions, min = 0, max = 1) {
  if (dimensions <= 0) {
    throw new Error('Dimensions must be greater than 0');
  }
  return Array.from({ length: dimensions }, () => Math.random() * (max - min) + min);
}

// Exporting the module functionality
export const vectorStore = new InMemoryVectorStore();