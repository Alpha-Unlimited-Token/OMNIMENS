/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextCompressionEngine
 * Written: 2026-04-03T09:09:56.070Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextCompressionEngine.mjs

import { createHash } from 'crypto';

/**
 * Generates a compact embedding for a given text input using a simple hashing-based vector quantization approach.
 * @param {string} text - The input text to compress into an embedding.
 * @param {number} dimensions - The number of dimensions for the embedding vector.
 * @returns {Float32Array} - A fixed-size embedding representing the text.
 */
export function generateEmbedding(text, dimensions = 128) {
  if (typeof text !== 'string' || dimensions <= 0) {
    throw new Error('Invalid input: text must be a string and dimensions must be a positive integer.');
  }

  const hash = createHash('sha256').update(text).digest();
  const embedding = new Float32Array(dimensions);

  for (let i = 0; i < hash.length; i++) {
    embedding[i % dimensions] += hash[i] / 255; // Normalize hash values to [0, 1]
  }

  return embedding;
}

/**
 * Summarizes a long text input into a shorter, more concise version.
 * @param {string} text - The input text to summarize.
 * @param {number} maxLength - The maximum length of the summary.
 * @returns {string} - A summarized version of the input text.
 */
export function summarizeText(text, maxLength = 100) {
  if (typeof text !== 'string' || maxLength <= 0) {
    throw new Error('Invalid input: text must be a string and maxLength must be a positive integer.');
  }

  const sentences = text.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|\!)\s/);
  let summary = '';

  for (const sentence of sentences) {
    if ((summary + sentence).length > maxLength) break;
    summary += sentence + ' ';
  }

  return summary.trim();
}

/**
 * Combines multiple embeddings into a single averaged embedding.
 * @param {Float32Array[]} embeddings - An array of embeddings to combine.
 * @returns {Float32Array} - The averaged embedding.
 */
export function combineEmbeddings(embeddings) {
  if (!Array.isArray(embeddings) || embeddings.length === 0) {
    throw new Error('Invalid input: embeddings must be a non-empty array of Float32Array.');
  }

  const dimensions = embeddings[0].length;
  const combined = new Float32Array(dimensions);

  for (const embedding of embeddings) {
    if (embedding.length !== dimensions) {
      throw new Error('All embeddings must have the same dimensions.');
    }

    for (let i = 0; i < dimensions; i++) {
      combined[i] += embedding[i];
    }
  }

  for (let i = 0; i < dimensions; i++) {
    combined[i] /= embeddings.length;
  }

  return combined;
}

/**
 * Compresses a long text input into a summarized embedding.
 * @param {string} text - The input text to compress.
 * @param {number} embeddingDimensions - The number of dimensions for the embedding vector.
 * @param {number} summaryLength - The maximum length of the summary.
 * @returns {{ summary, embedding}} - An object containing the summary and its embedding.
 */
export function compressContext(text, embeddingDimensions = 128, summaryLength = 100) {
  const summary = summarizeText(text, summaryLength);
  const embedding = generateEmbedding(summary, embeddingDimensions);
  return { summary, embedding };
}

/**
 * Calculates the cosine similarity between two embeddings.
 * @param {Float32Array} embedding1 - The first embedding.
 * @param {Float32Array} embedding2 - The second embedding.
 * @returns {number} - The cosine similarity between the two embeddings.
 */
export function cosineSimilarity(embedding1, embedding2) {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings must have the same dimensions.');
  }

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    magnitude1 += embedding1[i] ** 2;
    magnitude2 += embedding2[i] ** 2;
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  return dotProduct / (magnitude1 * magnitude2);
}
