// semanticMemoryManager.js

/**
 * @module semanticMemoryManager
 * @description A utility module for storing and retrieving context embeddings for long-term semantic memory.
 * Implements an in-memory vector store combined with clustering algorithms for efficient retrieval.
 */

/**
 * @typedef {Object} Vector
 * @property {Array<number>} values - The numerical values representing the embedding.
 * @property {string} id - A unique identifier for the vector.
 */

/**
 * @typedef {Object} Cluster
 * @property {Array<Vector>} vectors - The vectors contained within the cluster.
 * @property {Vector} centroid - The centroid vector of the cluster.
 */

const crypto = require('crypto');

/**
 * Generates a unique identifier for a vector.
 * @returns {string} A unique identifier.
 */
function generateId() {
  return crypto.randomUUID();
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {Array<number>} vectorA - The first vector.
 * @param {Array<number>} vectorB - The second vector.
 * @returns {number} The Euclidean distance.
 */
function calculateDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same dimension.');
  }
  return Math.sqrt(vectorA.reduce((sum, value, index) => sum + Math.pow(value - vectorB[index], 2), 0));
}

/**
 * Calculates the centroid of a set of vectors.
 * @param {Array<Vector>} vectors - The vectors to calculate the centroid for.
 * @returns {Vector} The centroid vector.
 */
function calculateCentroid(vectors) {
  const dimension = vectors[0].values.length;
  const summedValues = new Array(dimension).fill(0);

  for (const vector of vectors) {
    vector.values.forEach((value, index) => {
      summedValues[index] += value;
    });
  }

  const averagedValues = summedValues.map(sum => sum / vectors.length);
  return { values: averagedValues, id: generateId() };
}

/**
 * Class representing the semantic memory manager.
 */
class SemanticMemoryManager {
  constructor() {
    this.vectors = [];
    this.clusters = [];
  }

  /**
   * Adds a vector to the memory.
   * @param {Array<number>} values - The numerical values of the vector.
   * @returns {string} The ID of the added vector.
   */
  addVector(values) {
    const id = generateId();
    this.vectors.push({ values, id });
    return id;
  }

  /**
   * Retrieves the closest vector to the given query vector.
   * @param {Array<number>} query - The query vector.
   * @returns {Vector|null} The closest vector or null if no vectors exist.
   */
  retrieveClosest(query) {
    if (this.vectors.length === 0) return null;

    let closestVector = null;
    let closestDistance = Infinity;

    for (const vector of this.vectors) {
      const distance = calculateDistance(query, vector.values);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestVector = vector;
      }
    }

    return closestVector;
  }

  /**
   * Clusters the stored vectors into groups based on proximity.
   * Uses a simple k-means-like algorithm for demonstration purposes.
   * @param {number} numClusters - The number of clusters to create.
   * @returns {Array<Cluster>} The clusters.
   */
  clusterVectors(numClusters) {
    if (numClusters <= 0 || numClusters > this.vectors.length) {
      throw new Error('Invalid number of clusters.');
    }

    // Initialize centroids randomly
    const centroids = this.vectors.slice(0, numClusters).map(v => ({ ...v }));
    let clusters = [];

    for (let iteration = 0; iteration < 10; iteration++) { // Limit iterations for simplicity
      clusters = Array.from({ length: numClusters }, () => []);

      // Assign vectors to closest centroid
      for (const vector of this.vectors) {
        let closestCentroidIndex = 0;
        let closestDistance = Infinity;

        centroids.forEach((centroid, index) => {
          const distance = calculateDistance(vector.values, centroid.values);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestCentroidIndex = index;
          }
        });

        clusters[closestCentroidIndex].push(vector);
      }

      // Recalculate centroids
      centroids.forEach((_, index) => {
        if (clusters[index].length > 0) {
          centroids[index] = calculateCentroid(clusters[index]);
        }
      });
    }

    return clusters.map((vectors, index) => ({ vectors, centroid: centroids[index] }));
  }
}

module.exports = {
  SemanticMemoryManager,
  calculateDistance,
  calculateCentroid,
  generateId
};