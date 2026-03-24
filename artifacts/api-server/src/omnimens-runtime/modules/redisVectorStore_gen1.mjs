/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: redisVectorStore
 * Written: 2026-03-23T10:13:35.255Z
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
 * @module redisVectorStore
 * @description Implements fast in-memory vector search and embedding recall using Redis-like data structures and periodic syncing to PostgreSQL.
 */

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The Euclidean distance between the vectors.
 */
export function calculateDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must be of the same length.");
  }
  return Math.sqrt(vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0));
}

/**
 * Finds the k nearest neighbors to a given query vector.
 * @param {number[][]} data - The dataset of vectors.
 * @param {number[]} query - The query vector.
 * @param {number} k - The number of neighbors to find.
 * @returns {Array<{ index, distance}>} - The k nearest neighbors with their indices and distances.
 */
export function findKNearestNeighbors(data, query, k) {
  if (!Array.isArray(data) || !Array.isArray(query) || typeof k !== "number" || k <= 0) {
    throw new Error("Invalid input parameters.");
  }

  const distances = data.map((vector, index) => ({
    index,
    distance: calculateDistance(vector, query)
  }));

  distances.sort((a, b) => a.distance - b.distance);

  return distances.slice(0, k);
}

/**
 * Periodically syncs in-memory data to a PostgreSQL-like structure.
 * @param {Object} memoryStore - The in-memory data store.
 * @param {Function} syncFunction - A function that simulates syncing to PostgreSQL.
 * @param {number} intervalMs - The interval in milliseconds for syncing.
 * @returns {NodeJS.Timeout} - The interval timer reference.
 */
export function startPeriodicSync(memoryStore, syncFunction, intervalMs) {
  if (typeof memoryStore !== "object" || typeof syncFunction !== "function" || typeof intervalMs !== "number" || intervalMs <= 0) {
    throw new Error("Invalid input parameters.");
  }

  return setInterval(() => {
    try {
      syncFunction(memoryStore);
    } catch (error) {
      console.error("Error during sync:", error);
    }
  }, intervalMs);
}

/**
 * Simulates a Redis-like in-memory vector store.
 * @class
 */
export class RedisVectorStore {
  constructor() {
    /** @type {Map<string, number[]>} */
    this.store = new Map();
  }

  /**
   * Adds a vector to the store.
   * @param {string} key - The key for the vector.
   * @param {number[]} vector - The vector to store.
   */
  addVector(key, vector) {
    if (typeof key !== "string" || !Array.isArray(vector)) {
      throw new Error("Invalid key or vector.");
    }
    this.store.set(key, vector);
  }

  /**
   * Retrieves a vector by its key.
   * @param {string} key - The key of the vector.
   * @returns {number[] | undefined} - The vector, or undefined if not found.
   */
  getVector(key) {
    return this.store.get(key);
  }

  /**
   * Searches for the nearest neighbors to a query vector.
   * @param {number[]} query - The query vector.
   * @param {number} k - The number of neighbors to find.
   * @returns {Array<{ key, distance}>} - The k nearest neighbors with their keys and distances.
   */
  search(query, k) {
    const data = Array.from(this.store.entries()).map(([key, vector]) => ({ key, vector }));
    const distances = data.map(({ key, vector }) => ({
      key,
      distance: calculateDistance(vector, query)
    }));

    distances.sort((a, b) => a.distance - b.distance);

    return distances.slice(0, k);
  }
}

/**
 * Simulates syncing the in-memory store to PostgreSQL.
 * @param {Map<string, number[]>} memoryStore - The in-memory data store.
 */
export function syncToPostgreSQL(memoryStore) {
  console.log("Syncing to PostgreSQL:", Array.from(memoryStore.entries()));
}