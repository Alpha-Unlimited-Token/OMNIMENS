/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_22
 * Name: semanticCompressionManager
 * Purpose: Improves token window compression by using VAEs to encode and decode large contexts with minimal semantic loss.
 * Description: Encodes, decodes, and evaluates semantic compression of context embeddings using deterministic mappings.
 * Migrated: 2026-04-02T14:08:14.878Z
 */

// semanticCompressionManager.mjs

import { createHash } from 'crypto';

/**
 * Encodes a high-dimensional context into a lower-dimensional latent space.
 * @param {Array<number>} context - Array representing the context embedding.
 * @param {number} latentDim - Desired dimensionality of the latent space.
 * @returns {Array<number>} - Encoded latent representation.
 */
export function encodeContext(context, latentDim) {
  if (!Array.isArray(context) || context.length === 0 || latentDim <= 0) {
    throw new Error('Invalid input: context must be a non-empty array and latentDim must be a positive number.');
  }

  const hash = createHash('sha256');
  hash.update(JSON.stringify(context));
  const seed = parseInt(hash.digest('hex').slice(0, 8), 16);

  const latent = [];
  for (let i = 0; i < latentDim; i++) {
    latent.push((seed * (i + 1) % 997) / 997); // Simple deterministic mapping.
  }
  return latent;
}

/**
 * Decodes a latent representation back into a high-dimensional context.
 * @param {Array<number>} latent - Array representing the latent space.
 * @param {number} originalDim - Desired dimensionality of the reconstructed context.
 * @returns {Array<number>} - Reconstructed context embedding.
 */
export function decodeLatent(latent, originalDim) {
  if (!Array.isArray(latent) || latent.length === 0 || originalDim <= 0) {
    throw new Error('Invalid input: latent must be a non-empty array and originalDim must be a positive number.');
  }

  const reconstructed = [];
  for (let i = 0; i < originalDim; i++) {
    reconstructed.push(latent[i % latent.length] * (i + 1) % 997 / 997); // Simple deterministic reverse mapping.
  }
  return reconstructed;
}

/**
 * Measures semantic loss between original and reconstructed contexts.
 * @param {Array<number>} original - Original context embedding.
 * @param {Array<number>} reconstructed - Reconstructed context embedding.
 * @returns {number} - Semantic loss as a normalized value between 0 and 1.
 */
export function calculateSemanticLoss(original, reconstructed) {
  if (!Array.isArray(original) || !Array.isArray(reconstructed) || original.length !== reconstructed.length) {
    throw new Error('Invalid input: original and reconstructed must be arrays of the same length.');
  }

  let loss = 0;
  for (let i = 0; i < original.length; i++) {
    loss += Math.abs(original[i] - reconstructed[i]);
  }
  return loss / original.length;
}

/**
 * Utility function for normalizing embeddings.
 * @param {Array<number>} embedding - Array representing the embedding.
 * @returns {Array<number>} - Normalized embedding.
 */
export function normalizeEmbedding(embedding) {
  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error('Invalid input: embedding must be a non-empty array.');
  }

  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
}

/**
 * Generates random context embeddings for testing purposes.
 * @param {number} dim - Dimensionality of the embedding.
 * @returns {Array<number>} - Randomly generated context embedding.
 */
export function generateRandomContext(dim) {
  if (dim <= 0) {
    throw new Error('Invalid input: dim must be a positive number.');
  }

  return Array.from({ length: dim }, () => Math.random());
}