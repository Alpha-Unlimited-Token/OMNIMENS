/**
 * @module slidingWindowMemory
 * @description This module dynamically summarizes and compresses old context using hierarchical clustering and summary embeddings.
 * It helps extend effective memory by retaining key information while discarding irrelevant details.
 */

/**
 * Hierarchical clustering function to group similar data points.
 * @param {Array<Array<number>>} embeddings - Array of numerical vectors representing data points.
 * @param {number} threshold - Distance threshold for clustering.
 * @returns {Array<Array<number>>} - Array of clusters, where each cluster is an array of indices from the input embeddings.
 */
export function hierarchicalClustering(embeddings, threshold) {
  const clusters = [];
  const visited = new Set();

  /**
   * Calculate Euclidean distance between two vectors.
   * @param {Array<number>} vec1 - First vector.
   * @param {Array<number>} vec2 - Second vector.
   * @returns {number} - Euclidean distance.
   */
  function euclideanDistance(vec1, vec2) {
    return Math.sqrt(vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0));
  }

  for (let i = 0; i < embeddings.length; i++) {
    if (visited.has(i)) continue;
    const cluster = [i];
    visited.add(i);

    for (let j = 0; j < embeddings.length; j++) {
      if (i !== j && !visited.has(j)) {
        if (euclideanDistance(embeddings[i], embeddings[j]) <= threshold) {
          cluster.push(j);
          visited.add(j);
        }
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}

/**
 * Generate summary embeddings for each cluster.
 * @param {Array<Array<number>>} embeddings - Array of numerical vectors representing data points.
 * @param {Array<Array<number>>} clusters - Array of clusters, where each cluster is an array of indices from the embeddings.
 * @returns {Array<Array<number>>} - Array of summary embeddings, one for each cluster.
 */
export function generateSummaryEmbeddings(embeddings, clusters) {
  return clusters.map(cluster => {
    const clusterVectors = cluster.map(index => embeddings[index]);
    const dimension = clusterVectors[0].length;

    // Calculate the centroid of the cluster
    const centroid = Array(dimension).fill(0);
    clusterVectors.forEach(vector => {
      vector.forEach((val, i) => {
        centroid[i] += val;
      });
    });
    return centroid.map(val => val / clusterVectors.length);
  });
}

/**
 * Sliding window memory manager to retain key information and discard old context.
 * @param {Array<Array<number>>} embeddings - Array of numerical vectors representing data points.
 * @param {number} windowSize - Maximum number of embeddings to retain.
 * @param {number} threshold - Distance threshold for clustering.
 * @returns {Array<Array<number>>} - Array of summary embeddings representing the retained memory.
 */
export function slidingWindowMemory(embeddings, windowSize, threshold) {
  if (embeddings.length <= windowSize) {
    return embeddings;
  }

  // Take the most recent embeddings within the sliding window
  const recentEmbeddings = embeddings.slice(-windowSize);

  // Perform hierarchical clustering
  const clusters = hierarchicalClustering(recentEmbeddings, threshold);

  // Generate summary embeddings for the clusters
  return generateSummaryEmbeddings(recentEmbeddings, clusters);
}

/**
 * Example usage of the sliding window memory module.
 * Demonstrates clustering and summarizing embeddings.
 */
function exampleUsage() {
  const embeddings = [
    [1.0, 2.0],
    [1.1, 2.1],
    [5.0, 5.0],
    [5.1, 5.1],
    [10.0, 10.0]
  ];
  const windowSize = 4;
  const threshold = 0.5;

  const retainedMemory = slidingWindowMemory(embeddings, windowSize, threshold);
  console.log("Retained Memory:", retainedMemory);
}

// Uncomment the following line to test the module
// exampleUsage();