/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-02T14:54:39.871Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchicalMemoryManager.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for an object to track context layers.
 * @param {object} obj - The object to hash.
 * @returns {string} - A unique hash string.
 */
export function generateObjectHash(obj) {
    const json = JSON.stringify(obj);
    return createHash('sha256').update(json).digest('hex');
}

/**
 * Compresses input data into a latent representation using weighted averaging.
 * @param {Array<number>} data - Array of numerical values.
 * @param {Array<number>} weights - Array of weights corresponding to data.
 * @returns {number} - The compressed latent value.
 */
export function compressLatentRepresentation(data, weights) {
    if (data.length !== weights.length) {
        throw new Error('Data and weights arrays must have the same length.');
    }
    const weightedSum = data.reduce((sum, value, index) => sum + value * weights[index], 0);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    return totalWeight === 0 ? 0 : weightedSum / totalWeight;
}

/**
 * Dynamically adjusts importance weights based on recency and relevance.
 * @param {Array<number>} recencyScores - Array of recency scores (higher is more recent).
 * @param {Array<number>} relevanceScores - Array of relevance scores (higher is more relevant).
 * @param {number} recencyBias - Weight given to recency (0 to 1).
 * @returns {Array<number>} - Adjusted importance weights.
 */
export function adjustImportanceWeights(recencyScores, relevanceScores, recencyBias = 0.5) {
    if (recencyScores.length !== relevanceScores.length) {
        throw new Error('Recency and relevance arrays must have the same length.');
    }
    if (recencyBias < 0 || recencyBias > 1) {
        throw new Error('Recency bias must be between 0 and 1.');
    }
    return recencyScores.map((recency, index) => {
        const relevance = relevanceScores[index];
        return recencyBias * recency + (1 - recencyBias) * relevance;
    });
}

/**
 * Creates a hierarchical memory structure linking summaries and latent embeddings.
 * @param {Array<object>} layers - Array of memory layers, each containing `summary` and `embedding`.
 * @returns {object} - Hierarchical memory structure.
 */
export function createHierarchicalMemory(layers) {
    return layers.reduce((hierarchy, layer, index) => {
        const hash = generateObjectHash(layer);
        hierarchy[hash] = {
            summary: layer.summary,
            embedding: layer.embedding,
            importance: index + 1 // Default importance based on layer order
        };
        return hierarchy;
    }, {});
}

/**
 * Retrieves the most important memory layer based on dynamic weights.
 * @param {object} memory - Hierarchical memory structure.
 * @param {Array<number>} weights - Array of importance weights.
 * @returns {object} - Most important memory layer.
 */
export function getMostImportantMemory(memory, weights) {
    const entries = Object.entries(memory);
    if (entries.length !== weights.length) {
        throw new Error('Memory layers and weights must have the same length.');
    }
    const indexedEntries = entries.map(([hash, layer], index) => ({ hash, layer, weight: weights[index] }));
    indexedEntries.sort((a, b) => b.weight - a.weight);
    return indexedEntries[0].layer;
}

/**
 * Updates a memory layer with new data, preserving hierarchical structure.
 * @param {object} memory - Hierarchical memory structure.
 * @param {string} hash - Hash of the memory layer to update.
 * @param {object} newData - New data to merge into the memory layer.
 * @returns {object} - Updated hierarchical memory.
 */
export function updateMemoryLayer(memory, hash, newData) {
    if (!memory[hash]) {
        throw new Error('Memory layer not found for the given hash.');
    }
    memory[hash] = {
        ...memory[hash],
        ...newData
    };
    return memory;
}

/**
 * Normalizes an array of weights to sum to 1.
 * @param {Array<number>} weights - Array of weights.
 * @returns {Array<number>} - Normalized weights.
 */
export function normalizeWeights(weights) {
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    return total === 0 ? weights.map(() => 0) : weights.map(weight => weight / total);
}
