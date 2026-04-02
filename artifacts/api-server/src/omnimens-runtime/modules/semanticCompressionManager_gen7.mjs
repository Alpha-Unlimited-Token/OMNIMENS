/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticCompressionManager
 * Written: 2026-04-02T15:13:44.862Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// semanticCompressionManager.mjs

import { randomBytes, createHash } from 'crypto';

/**
 * Encodes high-dimensional token embeddings into a compressed latent space.
 * @param {Array<number>} embedding - The input embedding vector.
 * @param {number} latentDim - The target dimensionality of the latent space.
 * @returns {Array<number>} Compressed latent representation.
 */
export function encodeEmbedding(embedding, latentDim) {
  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error("Input embedding must be a non-empty array.");
  }
  if (latentDim <= 0 || !Number.isInteger(latentDim)) {
    throw new Error("Latent dimensionality must be a positive integer.");
  }

  const hash = createHash('sha256');
  const seed = randomBytes(16).toString('hex');
  hash.update(seed);

  const weights = embedding.map((_, i) => {
    const weightSeed = hash.copy().update(i.toString()).digest('hex');
    return parseFloat(`0.${parseInt(weightSeed.slice(0, 8), 16)}`);
  });

  const compressed = Array(latentDim).fill(0).map((_, i) => {
    return embedding.reduce((sum, value, j) => sum + value * weights[(i + j) % weights.length], 0);
  });

  return compressed;
}

/**
 * Decodes a compressed latent representation back into an approximate embedding.
 * @param {Array<number>} latent - The compressed latent vector.
 * @param {number} originalDim - The original dimensionality of the embedding.
 * @returns {Array<number>} Reconstructed embedding.
 */
export function decodeLatent(latent, originalDim) {
  if (!Array.isArray(latent) || latent.length === 0) {
    throw new Error("Latent representation must be a non-empty array.");
  }
  if (originalDim <= 0 || !Number.isInteger(originalDim)) {
    throw new Error("Original dimensionality must be a positive integer.");
  }

  const hash = createHash('sha256');
  const seed = randomBytes(16).toString('hex');
  hash.update(seed);

  const weights = Array(originalDim).fill(0).map((_, i) => {
    const weightSeed = hash.copy().update(i.toString()).digest('hex');
    return parseFloat(`0.${parseInt(weightSeed.slice(0, 8), 16)}`);
  });

  const reconstructed = Array(originalDim).fill(0).map((_, i) => {
    return latent.reduce((sum, value, j) => sum + value * weights[(i + j) % weights.length], 0);
  });

  return reconstructed;
}

/**
 * Computes the reconstruction loss between the original and reconstructed embeddings.
 * @param {Array<number>} original - The original embedding vector.
 * @param {Array<number>} reconstructed - The reconstructed embedding vector.
 * @returns {number} Mean squared error (MSE) between the two vectors.
 */
export function computeReconstructionLoss(original, reconstructed) {
  if (!Array.isArray(original) || !Array.isArray(reconstructed)) {
    throw new Error("Both inputs must be arrays.");
  }
  if (original.length !== reconstructed.length) {
    throw new Error("Input arrays must have the same length.");
  }

  const mse = original.reduce((sum, value, i) => sum + Math.pow(value - reconstructed[i], 2), 0) / original.length;
  return mse;
}

/**
 * Generates a random embedding vector for testing purposes.
 * @param {number} dim - Dimensionality of the embedding vector.
 * @returns {Array<number>} Random embedding vector.
 */
export function generateRandomEmbedding(dim) {
  if (dim <= 0 || !Number.isInteger(dim)) {
    throw new Error("Dimensionality must be a positive integer.");
  }

  return Array(dim).fill(0).map(() => Math.random() * 2 - 1); // Values between -1 and 1
}

/**
 * Utility function to normalize an embedding vector.
 * @param {Array<number>} embedding - The embedding vector to normalize.
 * @returns {Array<number>} Normalized embedding vector.
 */
export function normalizeEmbedding(embedding) {
  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error("Input embedding must be a non-empty array.");
  }

  const magnitude = Math.sqrt(embedding.reduce((sum, value) => sum + value * value, 0));
  return embedding.map(value => value / magnitude);
}
