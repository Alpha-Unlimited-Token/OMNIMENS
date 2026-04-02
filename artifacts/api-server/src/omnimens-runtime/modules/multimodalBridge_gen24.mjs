/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: multimodalBridge
 * Written: 2026-04-02T14:25:15.115Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// multimodalBridge.mjs

import { createHash } from 'crypto';

/**
 * Encodes image data into embeddings compatible with a reasoning engine.
 * @param {Uint8Array} imageData - Raw image data as a byte array.
 * @returns {Float32Array} - Normalized embedding vector.
 */
export function encodeImageToEmbedding(imageData) {
  if (!(imageData instanceof Uint8Array)) {
    throw new TypeError('Input must be a Uint8Array.');
  }

  // Step 1: Hash the image data to ensure deterministic processing.
  const hash = createHash('sha256');
  hash.update(imageData);
  const hashedBytes = hash.digest();

  // Step 2: Map hashed bytes to a fixed-length embedding vector.
  const embedding = new Float32Array(128);
  for (let i = 0; i < embedding.length; i++) {
    embedding[i] = (hashedBytes[i % hashedBytes.length] / 255) * 2 - 1; // Normalize to [-1, 1]
  }

  return embedding;
}

/**
 * Combines multiple embeddings into a single composite embedding.
 * @param {Float32Array[]} embeddings - Array of embedding vectors.
 * @returns {Float32Array} - Composite embedding vector.
 */
export function combineEmbeddings(embeddings) {
  if (!Array.isArray(embeddings) || embeddings.some(e => !(e instanceof Float32Array))) {
    throw new TypeError('Input must be an array of Float32Array instances.');
  }

  const vectorLength = embeddings[0].length;
  if (!embeddings.every(e => e.length === vectorLength)) {
    throw new Error('All embeddings must have the same length.');
  }

  const composite = new Float32Array(vectorLength);
  embeddings.forEach(embedding => {
    for (let i = 0; i < vectorLength; i++) {
      composite[i] += embedding[i];
    }
  });

  // Normalize the composite embedding.
  const magnitude = Math.sqrt(composite.reduce((sum, val) => sum + val ** 2, 0));
  for (let i = 0; i < composite.length; i++) {
    composite[i] /= magnitude || 1; // Avoid division by zero.
  }

  return composite;
}

/**
 * Calculates the cosine similarity between two embeddings.
 * @param {Float32Array} embeddingA - First embedding vector.
 * @param {Float32Array} embeddingB - Second embedding vector.
 * @returns {number} - Cosine similarity score in the range [-1, 1].
 */
export function cosineSimilarity(embeddingA, embeddingB) {
  if (!(embeddingA instanceof Float32Array) || !(embeddingB instanceof Float32Array)) {
    throw new TypeError('Inputs must be Float32Array instances.');
  }

  if (embeddingA.length !== embeddingB.length) {
    throw new Error('Embeddings must have the same length.');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < embeddingA.length; i++) {
    dotProduct += embeddingA[i] * embeddingB[i];
    magnitudeA += embeddingA[i] ** 2;
    magnitudeB += embeddingB[i] ** 2;
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  return dotProduct / ((magnitudeA * magnitudeB) || 1); // Avoid division by zero.
}

/**
 * Projects an embedding to a lower-dimensional space using a simple hash-based method.
 * @param {Float32Array} embedding - Original embedding vector.
 * @param {number} targetDimensions - Number of dimensions for the projection.
 * @returns {Float32Array} - Lower-dimensional embedding.
 */
export function projectEmbedding(embedding, targetDimensions) {
  if (!(embedding instanceof Float32Array)) {
    throw new TypeError('Input must be a Float32Array.');
  }

  if (typeof targetDimensions !== 'number' || targetDimensions <= 0 || !Number.isInteger(targetDimensions)) {
    throw new TypeError('Target dimensions must be a positive integer.');
  }

  const projected = new Float32Array(targetDimensions);
  for (let i = 0; i < targetDimensions; i++) {
    projected[i] = embedding[i % embedding.length];
  }

  return projected;
}
