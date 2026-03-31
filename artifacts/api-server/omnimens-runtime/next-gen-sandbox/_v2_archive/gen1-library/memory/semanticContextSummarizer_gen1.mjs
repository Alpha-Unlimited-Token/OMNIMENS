/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: semanticContextSummarizer
 * Purpose: Summarize conversation history into compact semantic embeddings for long-term memory.
 * Description: Summarizes conversation history into compact semantic embeddings using vectorization and clustering for OMNIMENS's long-term memory.
 * Migrated: 2026-03-25T22:49:34.194Z
 */

// semanticContextSummarizer.js

/**
 * @module semanticContextSummarizer
 * @description Summarizes conversation history into compact semantic embeddings for long-term memory.
 */

/**
 * Generates semantic embeddings for input text using a simplified vectorization algorithm.
 * @param {string[]} sentences - Array of sentences to embed.
 * @returns {number[][]} - Array of numerical embeddings for each sentence.
 */
export function generateEmbeddings(sentences) {
  if (!Array.isArray(sentences) || sentences.some(s => typeof s !== 'string')) {
    throw new TypeError('Input must be an array of strings.');
  }

  return sentences.map(sentence => {
    const normalized = sentence.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    const words = normalized.split(' ');
    const wordVectors = words.map(word => {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = Math.imul(31, hash) + word.charCodeAt(i);
      }
      return hash % 1000 / 1000; // Normalize to [0, 1]
    });
    const embedding = Array(10).fill(0).map((_, i) => {
      return wordVectors.reduce((acc, val, idx) => acc + val * Math.sin((idx + 1) * (i + 1)), 0);
    });
    return embedding;
  });
}

/**
 * Clusters embeddings by similarity, compressing context into representative embeddings.
 * @param {number[][]} embeddings - Array of numerical embeddings.
 * @param {number} clusterCount - Desired number of clusters.
 * @returns {number[][]} - Array of representative embeddings for each cluster.
 */
export function clusterEmbeddings(embeddings, clusterCount) {
  if (!Array.isArray(embeddings) || embeddings.some(e => !Array.isArray(e))) {
    throw new TypeError('Embeddings must be an array of numerical arrays.');
  }
  if (typeof clusterCount !== 'number' || clusterCount <= 0 || !Number.isInteger(clusterCount)) {
    throw new TypeError('Cluster count must be a positive integer.');
  }

  const centroids = embeddings.slice(0, clusterCount);
  let clusters = Array(clusterCount).fill(null).map(() => []);

  for (let iteration = 0; iteration < 10; iteration++) {
    clusters = Array(clusterCount).fill(null).map(() => []);

    embeddings.forEach(embedding => {
      const distances = centroids.map(centroid => {
        return embedding.reduce((sum, value, idx) => sum + Math.pow(value - centroid[idx], 2), 0);
      });
      const closestCluster = distances.indexOf(Math.min(...distances));
      clusters[closestCluster].push(embedding);
    });

    centroids.forEach((_, clusterIdx) => {
      if (clusters[clusterIdx].length > 0) {
        centroids[clusterIdx] = clusters[clusterIdx][0].map((_, dimIdx) => {
          return clusters[clusterIdx].reduce((sum, embedding) => sum + embedding[dimIdx], 0) / clusters[clusterIdx].length;
        });
      }
    });
  }

  return centroids;
}

/**
 * Summarizes conversation history into compact semantic embeddings.
 * @param {string[]} sentences - Array of sentences from conversation history.
 * @param {number} clusterCount - Desired number of clusters for summarization.
 * @returns {number[][]} - Array of representative embeddings summarizing the conversation.
 */
export function summarizeContext(sentences, clusterCount) {
  const embeddings = generateEmbeddings(sentences);
  return clusterEmbeddings(embeddings, clusterCount);
}