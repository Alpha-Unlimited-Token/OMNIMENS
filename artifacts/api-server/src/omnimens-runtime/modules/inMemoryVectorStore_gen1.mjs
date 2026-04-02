/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: inMemoryVectorStore
 * Written: 2026-04-02T22:07:40.154Z
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

/**
 * Utility function to calculate the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - Cosine similarity value between -1 and 1.
 */
export function cosineSimilarity(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
        throw new Error('Vectors must be of the same length');
    }

    const dotProduct = vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0; // Handle edge case where a vector has zero magnitude
    }

    return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Hashes a vector to a unique string identifier for efficient storage.
 * @param {number[]} vector - The vector to hash.
 * @returns {string} - A unique hash representing the vector.
 */
export function hashVector(vector) {
    const hash = createHash('sha256');
    hash.update(vector.join(','));
    return hash.digest('hex');
}

/**
 * Class representing an in-memory vector store with similarity search capabilities.
 */
export class InMemoryVectorStore {
    constructor() {
        this.store = new Map(); // Map to store vectors with their hashed keys
    }

    /**
     * Adds a vector to the store.
     * @param {number[]} vector - The vector to add.
     * @param {any} metadata - Optional metadata to store with the vector.
     */
    addVector(vector, metadata = null) {
        const key = hashVector(vector);
        this.store.set(key, { vector, metadata });
    }

    /**
     * Searches for the top N most similar vectors to the query vector.
     * @param {number[]} queryVector - The query vector.
     * @param {number} topN - The number of top results to return.
     * @returns {Array<{ vector, metadata, similarity}>} - Top N similar vectors.
     */
    search(queryVector, topN = 1) {
        if (topN <= 0) {
            throw new Error('topN must be greater than 0');
        }

        const results = [];

        for (const { vector, metadata } of this.store.values()) {
            const similarity = cosineSimilarity(queryVector, vector);
            results.push({ vector, metadata, similarity });
        }

        results.sort((a, b) => b.similarity - a.similarity); // Sort by descending similarity

        return results.slice(0, topN);
    }

    /**
     * Clears all vectors from the store.
     */
    clear() {
        this.store.clear();
    }
}

/**
 * Utility function to normalize a vector to unit length.
 * @param {number[]} vector - The vector to normalize.
 * @returns {number[]} - The normalized vector.
 */
export function normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
    if (magnitude === 0) {
        throw new Error('Cannot normalize a zero-magnitude vector');
    }
    return vector.map(val => val / magnitude);
}

/**
 * Utility function to generate a random vector of specified length.
 * @param {number} length - The length of the vector.
 * @param {number} [min=-1] - Minimum value for random components.
 * @param {number} [max=1] - Maximum value for random components.
 * @returns {number[]} - A random vector.
 */
export function generateRandomVector(length, min = -1, max = 1) {
    if (length <= 0) {
        throw new Error('Vector length must be greater than 0');
    }
    return Array.from({ length }, () => Math.random() * (max - min) + min);
}
