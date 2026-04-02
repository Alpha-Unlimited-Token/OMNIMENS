/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_64
 * Name: multimodalEmbeddingAligner
 * Purpose: Aligns text and image embeddings for simulated multimodal reasoning.
 * Description: Aligns text and image embeddings using cross-modal attention for multimodal reasoning and provides utilities for embedding operations.
 * Migrated: 2026-04-02T14:50:29.438Z
 */

// multimodalEmbeddingAligner.mjs

import { createHash } from 'crypto';

/**
 * Computes cosine similarity between two embedding vectors.
 * @param {number[]} vectorA - First embedding vector.
 * @param {number[]} vectorB - Second embedding vector.
 * @returns {number} - Cosine similarity score.
 */
export function computeCosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length');
  }

  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Aligns text and image embeddings using cross-modal attention.
 * @param {number[][]} textEmbeddings - Array of text embedding vectors.
 * @param {number[][]} imageEmbeddings - Array of image embedding vectors.
 * @returns {number[][]} - Matrix of similarity scores between text and image embeddings.
 */
export function alignEmbeddings(textEmbeddings, imageEmbeddings) {
  if (!Array.isArray(textEmbeddings) || !Array.isArray(imageEmbeddings)) {
    throw new Error('Both textEmbeddings and imageEmbeddings must be arrays');
  }

  return textEmbeddings.map(textVector => {
    return imageEmbeddings.map(imageVector => computeCosineSimilarity(textVector, imageVector));
  });
}

/**
 * Generates a hash-based identifier for embeddings to ensure uniqueness.
 * @param {number[]} embedding - Embedding vector.
 * @returns {string} - Unique hash identifier.
 */
export function generateEmbeddingHash(embedding) {
  if (!Array.isArray(embedding)) {
    throw new Error('Embedding must be an array');
  }

  const hash = createHash('sha256');
  hash.update(embedding.join(','));
  return hash.digest('hex');
}

/**
 * Normalizes embedding vectors to unit length.
 * @param {number[]} embedding - Embedding vector.
 * @returns {number[]} - Normalized embedding vector.
 */
export function normalizeEmbedding(embedding) {
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector');
  }

  return embedding.map(val => val / magnitude);
}

/**
 * Combines multiple embeddings into a single unified embedding.
 * @param {number[][]} embeddings - Array of embedding vectors.
 * @returns {number[]} - Unified embedding vector.
 */
export function combineEmbeddings(embeddings) {
  if (!Array.isArray(embeddings) || embeddings.length === 0) {
    throw new Error('Embeddings must be a non-empty array');
  }

  const dimension = embeddings[0].length;

  if (!embeddings.every(vec => vec.length === dimension)) {
    throw new Error('All embeddings must have the same dimension');
  }

  const combined = new Array(dimension).fill(0);

  embeddings.forEach(vec => {
    vec.forEach((val, i) => {
      combined[i] += val;
    });
  });

  return normalizeEmbedding(combined);
}

/**
 * Validates embedding dimensions for compatibility.
 * @param {number[][]} embeddings - Array of embedding vectors.
 * @returns {boolean} - True if all embeddings have the same dimension.
 */
export function validateEmbeddingDimensions(embeddings) {
  if (!Array.isArray(embeddings) || embeddings.length === 0) {
    throw new Error('Embeddings must be a non-empty array');
  }

  const dimension = embeddings[0].length;
  return embeddings.every(vec => vec.length === dimension);
}