/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_11
 * Name: contextRetentionManager
 * Purpose: Retains and integrates earlier conversation context using hierarchical summarization and vector embeddings.
 * Description: A utility module for hierarchical summarization, vector embedding, and LSH-based context retrieval to enhance multi-agent intelligence.
 * Migrated: 2026-04-01T22:23:20.231Z
 */

// contextRetentionManager.mjs

import crypto from 'crypto';

// Utility function to hash strings for LSH indexing
export function hashString(input, salt = 'default_salt') {
  const hash = crypto.createHash('sha256');
  hash.update(input + salt);
  return hash.digest('hex');
}

// Sliding window summarization with hierarchical attention
export function hierarchicalSummarization(contexts, windowSize = 5) {
  if (!Array.isArray(contexts) || contexts.length === 0) {
    throw new Error('Contexts must be a non-empty array.');
  }

  const summaries = [];

  for (let i = 0; i < contexts.length; i += windowSize) {
    const window = contexts.slice(i, i + windowSize);
    const summary = summarizeWindow(window);
    summaries.push(summary);
  }

  return summarizeWindow(summaries);
}

// Helper function to summarize a single window of text
function summarizeWindow(window) {
  // Naive summarization: concatenate and truncate to 200 chars
  const concatenated = window.join(' ');
  return concatenated.length > 200 ? concatenated.slice(0, 200) + '...' : concatenated;
}

// Vector embedding using basic token frequency (TF) representation
export function generateVectorEmbedding(text) {
  if (typeof text !== 'string') {
    throw new Error('Input must be a string.');
  }

  const tokens = text.toLowerCase().split(/\W+/).filter(Boolean);
  const frequencyMap = {};

  tokens.forEach(token => {
    frequencyMap[token] = (frequencyMap[token] || 0) + 1;
  });

  return frequencyMap;
}

// LSH-based vector indexing for approximate nearest neighbor search
export function lshIndex(vectors, numBuckets = 10) {
  if (!Array.isArray(vectors) || vectors.length === 0) {
    throw new Error('Vectors must be a non-empty array.');
  }

  const buckets = Array.from({ length: numBuckets }, () => []);

  vectors.forEach((vector, index) => {
    const hash = hashVector(vector, numBuckets);
    buckets[hash].push({ index, vector });
  });

  return buckets;
}

// Helper function to hash a vector into a bucket
function hashVector(vector, numBuckets) {
  const vectorString = JSON.stringify(vector);
  const hash = parseInt(hashString(vectorString).slice(0, 8), 16);
  return hash % numBuckets;
}

// Retrieve the most relevant context using vector similarity
export function retrieveContext(queryVector, buckets, similarityFunction = cosineSimilarity) {
  if (typeof queryVector !== 'object' || !Array.isArray(buckets)) {
    throw new Error('Invalid input: queryVector must be an object and buckets must be an array.');
  }

  let bestMatch = null;
  let bestScore = -Infinity;

  buckets.forEach(bucket => {
    bucket.forEach(({ vector }) => {
      const score = similarityFunction(queryVector, vector);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = vector;
      }
    });
  });

  return bestMatch;
}

// Cosine similarity function for vector comparison
export function cosineSimilarity(vec1, vec2) {
  const dotProduct = Object.keys(vec1).reduce((sum, key) => sum + (vec1[key] || 0) * (vec2[key] || 0), 0);
  const magnitude1 = Math.sqrt(Object.values(vec1).reduce((sum, val) => sum + val ** 2, 0));
  const magnitude2 = Math.sqrt(Object.values(vec2).reduce((sum, val) => sum + val ** 2, 0));

  if (magnitude1 === 0 || magnitude2 === 0) return 0;

  return dotProduct / (magnitude1 * magnitude2);
}

// Exported functions are designed to be reusable across multiple agents
// Examples: hierarchicalSummarization for summarization, generateVectorEmbedding for text analysis, retrieveContext for context-aware tasks