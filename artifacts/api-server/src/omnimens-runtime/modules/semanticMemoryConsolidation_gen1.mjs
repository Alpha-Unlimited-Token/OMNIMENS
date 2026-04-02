/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_8
 * Name: semanticMemoryConsolidation
 * Purpose: Periodically optimize and reorganize semantic memory for efficient retrieval and incremental updates.
 * Description: This module optimizes and reorganizes semantic memory using clustering and dimensionality reduction for efficient knowledge retrieval.
 * Migrated: 2026-04-02T14:21:19.474Z
 */

// semanticMemoryConsolidation.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given input string. Useful for deduplication and node identification.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Performs hierarchical clustering on a set of data points.
 * @param {Array<Array<number>>} data - Array of data points, each represented as an array of numbers.
 * @param {Function} distanceFunction - A function to calculate the distance between two points.
 * @returns {Object} - A dendrogram representing the hierarchical clustering.
 */
export function hierarchicalClustering(data, distanceFunction) {
  const clusters = data.map((point, index) => ({ id: index, points: [point] }));

  while (clusters.length > 1) {
    let minDistance = Infinity;
    let mergePair = [0, 1];

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const distance = distanceFunction(clusters[i].points[0], clusters[j].points[0]);
        if (distance < minDistance) {
          minDistance = distance;
          mergePair = [i, j];
        }
      }
    }

    const [i, j] = mergePair;
    const mergedCluster = {
      id: generateHash(`${clusters[i].id}-${clusters[j].id}`),
      points: [...clusters[i].points, ...clusters[j].points]
    };

    clusters.splice(j, 1);
    clusters.splice(i, 1);
    clusters.push(mergedCluster);
  }

  return clusters[0];
}

/**
 * Reduces the dimensionality of a dataset using a simple centroid-based approach.
 * @param {Array<Array<number>>} data - Array of data points, each represented as an array of numbers.
 * @returns {Array<number>} - A single centroid representing the reduced dataset.
 */
export function reduceDimensionality(data) {
  const dimension = data[0].length;
  const centroid = Array(dimension).fill(0);

  for (const point of data) {
    for (let i = 0; i < dimension; i++) {
      centroid[i] += point[i];
    }
  }

  for (let i = 0; i < dimension; i++) {
    centroid[i] /= data.length;
  }

  return centroid;
}

/**
 * Creates a compact knowledge graph by clustering and reducing data points.
 * @param {Array<Object>} knowledgeNodes - Array of knowledge nodes, each with an `id` and `vector` property.
 * @param {Function} distanceFunction - A function to calculate the distance between two vectors.
 * @returns {Object} - A compacted knowledge graph.
 */
export function createKnowledgeGraph(knowledgeNodes, distanceFunction) {
  const data = knowledgeNodes.map(node => node.vector);
  const dendrogram = hierarchicalClustering(data, distanceFunction);
  const reducedGraph = reduceDimensionality(data);

  return {
    dendrogram,
    reducedGraph
  };
}

/**
 * Example distance function: Euclidean distance.
 * @param {Array<number>} pointA - First data point.
 * @param {Array<number>} pointB - Second data point.
 * @returns {number} - The Euclidean distance between the two points.
 */
export function euclideanDistance(pointA, pointB) {
  return Math.sqrt(pointA.reduce((sum, val, i) => sum + Math.pow(val - pointB[i], 2), 0));
}
