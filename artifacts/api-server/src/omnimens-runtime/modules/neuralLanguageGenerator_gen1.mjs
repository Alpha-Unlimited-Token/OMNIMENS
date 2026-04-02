/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_19
 * Name: neuralLanguageGenerator
 * Purpose: Develop an independent generative language model leveraging OMNIMENS’s neural cognition engine.
 * Description: This module provides utilities for text tokenization, attention weight calculation, and generative text simulation using embeddings.
 * Migrated: 2026-04-02T14:08:14.879Z
 */

// Complete ES module code here

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given input string using SHA-256.
 * Useful for ensuring data integrity and creating unique identifiers.
 * @param {string} input - The input string to hash.
 * @returns {string} - The resulting SHA-256 hash in hexadecimal format.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Tokenizes a sentence into an array of words while removing punctuation.
 * Useful for preprocessing text for language models or text analysis.
 * @param {string} sentence - The sentence to tokenize.
 * @returns {string[]} - Array of words in the sentence.
 */
export function tokenize(sentence) {
  return sentence
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove punctuation
    .split(/\s+/) // Split by whitespace
    .filter(Boolean); // Remove empty strings
}

/**
 * Calculates attention weights for a sequence of tokens using a simple dot-product mechanism.
 * Useful for simulating basic attention mechanisms in transformer models.
 * @param {number[][]} query - The query vector (e.g., 512-dim embedding).
 * @param {number[][]} key - The key vector (e.g., 512-dim embedding).
 * @returns {number[]} - Array of attention weights for each token.
 */
export function calculateAttentionWeights(query, key) {
  if (!Array.isArray(query) || !Array.isArray(key) || query.length !== key.length) {
    throw new Error('Query and key must be arrays of the same length.');
  }

  const weights = query.map((q, i) => {
    const dotProduct = q.reduce((sum, qVal, j) => sum + qVal * key[i][j], 0);
    return Math.exp(dotProduct); // Exponential for softmax-like scaling
  });

  const sumWeights = weights.reduce((sum, w) => sum + w, 0);
  return weights.map(w => w / sumWeights); // Normalize to sum to 1
}

/**
 * Generates a sequence of text based on a given input prompt and embeddings.
 * Simulates a simple generative language model using embeddings and attention.
 * @param {string} prompt - The input text prompt.
 * @param {number[][]} embeddings - Pre-trained 512-dim embeddings for the vocabulary.
 * @param {number} maxTokens - Maximum number of tokens to generate.
 * @returns {string} - Generated text sequence.
 */
export function generateText(prompt, embeddings, maxTokens = 50) {
  if (typeof prompt !== 'string' || !Array.isArray(embeddings)) {
    throw new Error('Invalid input: prompt must be a string and embeddings must be an array.');
  }

  const tokens = tokenize(prompt);
  let generatedTokens = [...tokens];

  for (let i = 0; i < maxTokens; i++) {
    const lastToken = generatedTokens[generatedTokens.length - 1];
    const lastEmbedding = embeddings[lastToken] || new Array(512).fill(0);

    const attentionWeights = calculateAttentionWeights(
      [lastEmbedding],
      embeddings
    );

    const nextTokenIndex = attentionWeights.indexOf(Math.max(...attentionWeights));
    const nextToken = Object.keys(embeddings)[nextTokenIndex];

    if (!nextToken || nextToken === '<END>') break;

    generatedTokens.push(nextToken);
  }

  return generatedTokens.join(' ');
}

/**
 * Utility function to normalize a vector to unit length.
 * Useful for preparing embeddings for attention mechanisms or similarity calculations.
 * @param {number[]} vector - The input vector.
 * @returns {number[]} - The normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  return vector.map(val => val / (magnitude || 1));
}

/**
 * Computes cosine similarity between two vectors.
 * Useful for measuring similarity between embeddings or feature vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - Cosine similarity value between -1 and 1.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length.');
  }

  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b ** 2, 0));

  return dotProduct / ((magnitudeA * magnitudeB) || 1);
}