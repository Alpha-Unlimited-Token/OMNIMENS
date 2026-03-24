/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: localEmbeddingEngine
 * Written: 2026-03-24T13:15:42.072Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// localEmbeddingEngine.mjs
import { createHash } from 'crypto';

// Utility function to generate a hash for consistent vector IDs
export function generateHash(input) {
    const hash = createHash('sha256');
    hash.update(input);
    return hash.digest('hex');
}

// Function to compute cosine similarity between two vectors
export function cosineSimilarity(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
        throw new Error('Vectors must be of the same length');
    }

    const dotProduct = vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val * val, 0));

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0; // Avoid division by zero
    }

    return dotProduct / (magnitudeA * magnitudeB);
}

// Function to normalize a vector
export function normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0) {
        return vector.map(() => 0);
    }
    return vector.map(val => val / magnitude);
}

// Class to manage embeddings and perform similarity searches
export class LocalEmbeddingEngine {
    constructor() {
        this.embeddings = new Map(); // Store embeddings as { id: vector }
    }

    // Add a new embedding
    addEmbedding(id, vector) {
        if (!Array.isArray(vector) || vector.some(v => typeof v !== 'number')) {
            throw new Error('Embedding must be an array of numbers');
        }
        this.embeddings.set(id, normalizeVector(vector));
    }

    // Remove an embedding by ID
    removeEmbedding(id) {
        this.embeddings.delete(id);
    }

    // Find the most similar embeddings to a given vector
    findMostSimilar(vector, topN = 5) {
        if (!Array.isArray(vector) || vector.some(v => typeof v !== 'number')) {
            throw new Error('Input vector must be an array of numbers');
        }

        const normalizedVector = normalizeVector(vector);
        const similarities = Array.from(this.embeddings.entries()).map(([id, storedVector]) => {
            return { id, similarity: cosineSimilarity(normalizedVector, storedVector) };
        });

        similarities.sort((a, b) => b.similarity - a.similarity);
        return similarities.slice(0, topN);
    }

    // Get all stored embeddings (for debugging or analysis)
    getAllEmbeddings() {
        return Array.from(this.embeddings.entries());
    }
}

// Example utility function for creating random vectors (useful for testing)
export function generateRandomVector(length, min = -1, max = 1) {
    if (length <= 0) {
        throw new Error('Vector length must be greater than 0');
    }
    return Array.from({ length }, () => Math.random() * (max - min) + min);
}