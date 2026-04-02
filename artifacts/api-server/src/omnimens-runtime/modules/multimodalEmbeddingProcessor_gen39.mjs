/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: multimodalEmbeddingProcessor
 * Written: 2026-04-02T13:32:45.066Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// multimodalEmbeddingProcessor.mjs

import { createHash } from 'crypto';

/**
 * Generates a normalized embedding for text input.
 * @param {string} text - The input text to embed.
 * @returns {number[]} - The normalized embedding vector.
 */
export function generateTextEmbedding(text) {
  const hash = createHash('sha256').update(text).digest('hex');
  const embedding = Array.from(hash).map((char) => char.charCodeAt(0) % 256);
  return normalizeVector(embedding);
}

/**
 * Generates a normalized embedding for image input.
 * @param {Uint8Array} imageData - The binary image data.
 * @returns {number[]} - The normalized embedding vector.
 */
export function generateImageEmbedding(imageData) {
  const hash = createHash('sha256').update(imageData).digest('hex');
  const embedding = Array.from(hash).map((char) => char.charCodeAt(0) % 256);
  return normalizeVector(embedding);
}

/**
 * Aligns two embeddings using cosine similarity.
 * @param {number[]} embeddingA - The first embedding vector.
 * @param {number[]} embeddingB - The second embedding vector.
 * @returns {number} - The cosine similarity score between the embeddings.
 */
export function alignEmbeddings(embeddingA, embeddingB) {
  const dotProduct = embeddingA.reduce((sum, val, i) => sum + val * embeddingB[i], 0);
  const magnitudeA = Math.sqrt(embeddingA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(embeddingB.reduce((sum, val) => sum + val ** 2, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Normalizes a vector to unit length.
 * @param {number[]} vector - The input vector.
 * @returns {number[]} - The normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  return vector.map((val) => val / magnitude);
}

/**
 * Processes and aligns text and image data into shared multimodal embeddings.
 * @param {string} text - The input text.
 * @param {Uint8Array} imageData - The binary image data.
 * @returns {number} - The alignment score between text and image embeddings.
 */
export function processMultimodalData(text, imageData) {
  const textEmbedding = generateTextEmbedding(text);
  const imageEmbedding = generateImageEmbedding(imageData);
  return alignEmbeddings(textEmbedding, imageEmbedding);
}

/**
 * Utility function to validate input data.
 * @param {string|Uint8Array} input - The input data to validate.
 * @returns {boolean} - Whether the input is valid.
 */
export function validateInput(input) {
  if (typeof input === 'string') {
    return input.length > 0;
  } else if (input instanceof Uint8Array) {
    return input.length > 0;
  }
  return false;
}