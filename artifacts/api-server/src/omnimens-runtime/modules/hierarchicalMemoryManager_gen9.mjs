/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-01T22:13:57.974Z
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

// Utility function: Hashes input to create unique identifiers for memory blocks
export function hashInput(input) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(input));
  return hash.digest('hex');
}

// Utility function: Quantizes a vector into a fixed number of clusters
export function vectorQuantization(vectors, numClusters) {
  if (!Array.isArray(vectors) || vectors.length === 0 || numClusters <= 0) {
    throw new Error('Invalid input for vector quantization');
  }

  const centroids = vectors.slice(0, numClusters); // Initialize centroids with first vectors
  let assignments = new Array(vectors.length).fill(-1);

  for (let iteration = 0; iteration < 10; iteration++) { // Fixed number of iterations
    // Assign vectors to nearest centroid
    assignments = vectors.map(vec => {
      return centroids.reduce((closest, centroid, index) => {
        const distance = euclideanDistance(vec, centroid);
        return distance < closest.distance ? { index, distance } : closest;
      }, { index: -1, distance: Infinity }).index;
    });

    // Recompute centroids
    centroids = centroids.map((_, clusterIndex) => {
      const clusterVectors = vectors.filter((_, vecIndex) => assignments[vecIndex] === clusterIndex);
      return clusterVectors.length > 0 ? averageVector(clusterVectors) : centroids[clusterIndex];
    });
  }

  return { centroids, assignments };
}

// Utility function: Calculates Euclidean distance between two vectors
export function euclideanDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  return Math.sqrt(vec1.reduce((sum, val, index) => sum + Math.pow(val - vec2[index], 2), 0));
}

// Utility function: Computes average vector from an array of vectors
export function averageVector(vectors) {
  const dimensions = vectors[0].length;
  const sums = new Array(dimensions).fill(0);

  vectors.forEach(vec => {
    vec.forEach((val, index) => {
      sums[index] += val;
    });
  });

  return sums.map(sum => sum / vectors.length);
}

// Main function: Manages hierarchical memory
export function hierarchicalMemoryManager(context, shortTermBufferSize, numClusters) {
  if (!Array.isArray(context) || shortTermBufferSize <= 0 || numClusters <= 0) {
    throw new Error('Invalid input for hierarchical memory manager');
  }

  const shortTermBuffer = context.slice(-shortTermBufferSize); // Recent context
  const longTermMemory = vectorQuantization(context, numClusters); // Compressed memory

  return {
    shortTermBuffer,
    longTermMemory
  };
}

// Example utility: Retrieves relevant context from memory
export function retrieveContext(memory, queryVector) {
  const { shortTermBuffer, longTermMemory } = memory;

  // Search short-term buffer for exact match
  const exactMatch = shortTermBuffer.find(vec => vec.every((val, index) => val === queryVector[index]));
  if (exactMatch) return { type: 'short-term', data: exactMatch };

  // Search long-term memory for closest cluster
  const closestCluster = longTermMemory.centroids.reduce((closest, centroid, index) => {
    const distance = euclideanDistance(queryVector, centroid);
    return distance < closest.distance ? { index, distance } : closest;
  }, { index: -1, distance: Infinity });

  return { type: 'long-term', data: closestCluster };
}

// Example usage:
// const memory = hierarchicalMemoryManager([[1, 2], [3, 4], [5, 6]], 2, 2);
// const retrieved = retrieveContext(memory, [3, 4]);
