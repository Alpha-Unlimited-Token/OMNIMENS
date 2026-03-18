// semanticMemoryManager.js

/**
 * @module semanticMemoryManager
 * @description This module provides functionality to store and retrieve compressed conversation context
 * using sentence embeddings and clustering techniques for efficient memory management.
 * It is designed to maintain continuity of conversations beyond token limits.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * In-memory storage for embeddings and clusters (simulating PostgreSQL for simplicity).
 * Replace this with actual database queries for production environments.
 */
const memoryStorage = {
  embeddings: {}, // { id: { embedding: number[], text: string } }
  clusters: {} // { clusterId: { centroid: number[], texts: string[] } }
};

/**
 * Generate a unique ID for a given text.
 * @param {string} text - The input text.
 * @returns {string} A unique hash ID.
 */
function generateId(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Compute a simple sentence embedding by hashing words into numeric space.
 * @param {string} text - The input text.
 * @returns {number[]} A fixed-size numeric embedding.
 */
function computeEmbedding(text) {
  const words = text.split(/\s+/);
  const embedding = new Array(128).fill(0);
  words.forEach((word, index) => {
    const hash = crypto.createHash('md5').update(word).digest();
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] += hash[i % hash.length];
    }
  });
  return embedding.map(val => val / words.length);
}

/**
 * Calculate cosine similarity between two embeddings.
 * @param {number[]} a - First embedding.
 * @param {number[]} b - Second embedding.
 * @returns {number} Cosine similarity score.
 */
function cosineSimilarity(a, b) {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val ** 2, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Add a text to memory storage, updating clusters.
 * @param {string} text - The input text to store.
 */
function addToMemory(text) {
  const id = generateId(text);
  const embedding = computeEmbedding(text);
  memoryStorage.embeddings[id] = { embedding, text };

  let bestCluster = null;
  let bestSimilarity = 0;

  for (const [clusterId, cluster] of Object.entries(memoryStorage.clusters)) {
    const similarity = cosineSimilarity(embedding, cluster.centroid);
    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestCluster = clusterId;
    }
  }

  if (bestSimilarity > 0.8 && bestCluster) {
    // Add to existing cluster
    const cluster = memoryStorage.clusters[bestCluster];
    cluster.texts.push(text);
    cluster.centroid = cluster.centroid.map((val, i) => (val + embedding[i]) / 2);
  } else {
    // Create new cluster
    const newClusterId = generateId(`cluster-${Date.now()}`);
    memoryStorage.clusters[newClusterId] = { centroid: embedding, texts: [text] };
  }
}

/**
 * Retrieve the most relevant cluster for a given query.
 * @param {string} query - The input query text.
 * @returns {string[]} Relevant texts from the best matching cluster.
 */
function retrieveFromMemory(query) {
  const queryEmbedding = computeEmbedding(query);
  let bestCluster = null;
  let bestSimilarity = 0;

  for (const [clusterId, cluster] of Object.entries(memoryStorage.clusters)) {
    const similarity = cosineSimilarity(queryEmbedding, cluster.centroid);
    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestCluster = clusterId;
    }
  }

  return bestCluster ? memoryStorage.clusters[bestCluster].texts : [];
}

/**
 * Save memory storage to a JSON file.
 * @param {string} filePath - The file path to save the memory.
 */
function saveMemory(filePath) {
  fs.writeFileSync(filePath, JSON.stringify(memoryStorage, null, 2));
}

/**
 * Load memory storage from a JSON file.
 * @param {string} filePath - The file path to load the memory from.
 */
function loadMemory(filePath) {
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    memoryStorage.embeddings = data.embeddings || {};
    memoryStorage.clusters = data.clusters || {};
  }
}

module.exports = {
  addToMemory,
  retrieveFromMemory,
  saveMemory,
  loadMemory
};