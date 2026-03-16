// conversationSummarizer.js

/**
 * @module conversationSummarizer
 * @description Summarizes earlier context into embeddings for extended token window utilization.
 */

/**
 * Generates sentence embeddings using a simple numerical vectorization technique.
 * @param {string[]} sentences - Array of sentences to process.
 * @returns {number[][]} Array of numerical vectors representing sentence embeddings.
 */
export function generateEmbeddings(sentences) {
  return sentences.map(sentence => {
    const words = sentence.split(/\s+/);
    return words.map(word => word.length); // Simple embedding: word length as a proxy for semantic value.
  });
}

/**
 * Clusters embeddings into representative groups.
 * @param {number[][]} embeddings - Array of numerical vectors.
 * @param {number} clusterCount - Desired number of clusters.
 * @returns {number[][]} Array of representative vectors for each cluster.
 */
export function clusterEmbeddings(embeddings, clusterCount) {
  if (embeddings.length === 0 || clusterCount <= 0) {
    throw new Error("Invalid input: embeddings must be non-empty and clusterCount must be positive.");
  }

  // Initialize clusters with the first `clusterCount` embeddings.
  const clusters = embeddings.slice(0, clusterCount);

  let changed = true;
  while (changed) {
    const clusterAssignments = embeddings.map(embedding => {
      return clusters.reduce((closest, cluster, index) => {
        const distance = euclideanDistance(embedding, cluster);
        return distance < closest.distance ? { index, distance } : closest;
      }, { index: -1, distance: Infinity }).index;
    });

    const newClusters = Array.from({ length: clusterCount }, () => []);
    clusterAssignments.forEach((clusterIndex, i) => {
      newClusters[clusterIndex].push(embeddings[i]);
    });

    changed = false;
    for (let i = 0; i < clusterCount; i++) {
      const newCluster = calculateCentroid(newClusters[i]);
      if (!arraysEqual(clusters[i], newCluster)) {
        clusters[i] = newCluster;
        changed = true;
      }
    }
  }

  return clusters;
}

/**
 * Summarizes context by clustering sentence embeddings into representative vectors.
 * @param {string[]} sentences - Array of sentences to summarize.
 * @param {number} clusterCount - Desired number of clusters.
 * @returns {number[][]} Array of representative vectors summarizing the context.
 */
export function summarizeContext(sentences, clusterCount) {
  const embeddings = generateEmbeddings(sentences);
  return clusterEmbeddings(embeddings, clusterCount);
}

/**
 * Calculates the Euclidean distance between two numerical vectors.
 * @param {number[]} vec1 - First vector.
 * @param {number[]} vec2 - Second vector.
 * @returns {number} Euclidean distance.
 */
function euclideanDistance(vec1, vec2) {
  return Math.sqrt(vec1.reduce((sum, val, i) => sum + Math.pow(val - (vec2[i] || 0), 2), 0));
}

/**
 * Calculates the centroid of a cluster of vectors.
 * @param {number[][]} cluster - Array of numerical vectors.
 * @returns {number[]} Centroid vector.
 */
function calculateCentroid(cluster) {
  if (cluster.length === 0) return [];
  const dimension = cluster[0].length;
  const sums = Array(dimension).fill(0);
  cluster.forEach(vector => {
    vector.forEach((value, index) => {
      sums[index] += value;
    });
  });
  return sums.map(sum => sum / cluster.length);
}

/**
 * Checks if two arrays are equal.
 * @param {number[]} arr1 - First array.
 * @param {number[]} arr2 - Second array.
 * @returns {boolean} True if arrays are equal, false otherwise.
 */
function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((val, index) => val === arr2[index]);
}