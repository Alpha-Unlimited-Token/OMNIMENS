/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: internalLanguageModel
 * Written: 2026-04-03T08:37:51.023Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// internalLanguageModel.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash-based unique token for input text.
 * Useful for deduplication, indexing, or tokenization tasks.
 * @param {string} text - The input text to hash.
 * @returns {string} - A unique hash token.
 */
export function generateToken(text) {
  if (typeof text !== 'string' || text.length === 0) {
    throw new Error('Input must be a non-empty string.');
  }
  return createHash('sha256').update(text).digest('hex');
}

/**
 * Splits a given text into tokens based on whitespace and punctuation.
 * Useful for preprocessing text for language models or analysis.
 * @param {string} text - The input text to tokenize.
 * @returns {string[]} - An array of tokens.
 */
export function tokenizeText(text) {
  if (typeof text !== 'string') {
    throw new Error('Input must be a string.');
  }
  return text.match(/\b\w+\b/g) || [];
}

/**
 * Computes positional embeddings for a sequence of tokens.
 * Useful for transformer-based models to encode positional information.
 * @param {number} sequenceLength - The length of the token sequence.
 * @param {number} embeddingDim - The dimensionality of the embeddings.
 * @returns {number[][]} - A 2D array representing positional embeddings.
 */
export function computePositionalEmbeddings(sequenceLength, embeddingDim) {
  if (!Number.isInteger(sequenceLength) || sequenceLength <= 0) {
    throw new Error('sequenceLength must be a positive integer.');
  }
  if (!Number.isInteger(embeddingDim) || embeddingDim <= 0) {
    throw new Error('embeddingDim must be a positive integer.');
  }

  const embeddings = [];
  for (let pos = 0; pos < sequenceLength; pos++) {
    const embedding = [];
    for (let i = 0; i < embeddingDim; i++) {
      const angle = pos / Math.pow(10000, (2 * i) / embeddingDim);
      embedding.push(i % 2 === 0 ? Math.sin(angle) : Math.cos(angle));
    }
    embeddings.push(embedding);
  }
  return embeddings;
}

/**
 * Generates the next token in a sequence based on a simple probabilistic model.
 * Useful for simulating token generation in a language model.
 * @param {string[]} tokens - The current sequence of tokens.
 * @param {Object<string, number>} tokenProbabilities - A map of token probabilities.
 * @returns {string} - The next token.
 */
export function generateNextToken(tokens, tokenProbabilities) {
  if (!Array.isArray(tokens)) {
    throw new Error('tokens must be an array.');
  }
  if (typeof tokenProbabilities !== 'object' || tokenProbabilities === null) {
    throw new Error('tokenProbabilities must be a non-null object.');
  }

  const totalProbability = Object.values(tokenProbabilities).reduce((sum, p) => sum + p, 0);
  if (totalProbability <= 0) {
    throw new Error('Total probability must be greater than zero.');
  }

  const randomValue = Math.random() * totalProbability;
  let cumulativeProbability = 0;

  for (const [token, probability] of Object.entries(tokenProbabilities)) {
    cumulativeProbability += probability;
    if (randomValue <= cumulativeProbability) {
      return token;
    }
  }

  throw new Error('Failed to generate next token. Check tokenProbabilities.');
}

/**
 * Encodes a sequence of tokens into numerical representations.
 * Useful for input preparation in transformer-based models.
 * @param {string[]} tokens - The sequence of tokens to encode.
 * @param {Object<string, number>} tokenToIndex - A mapping of tokens to indices.
 * @returns {number[]} - An array of numerical indices.
 */
export function encodeTokens(tokens, tokenToIndex) {
  if (!Array.isArray(tokens)) {
    throw new Error('tokens must be an array.');
  }
  if (typeof tokenToIndex !== 'object' || tokenToIndex === null) {
    throw new Error('tokenToIndex must be a non-null object.');
  }

  return tokens.map(token => {
    if (!(token in tokenToIndex)) {
      throw new Error(`Token "${token}" not found in tokenToIndex.`);
    }
    return tokenToIndex[token];
  });
}

/**
 * Decodes a sequence of numerical indices back into tokens.
 * Useful for interpreting model outputs.
 * @param {number[]} indices - The sequence of numerical indices to decode.
 * @param {Object<number, string>} indexToToken - A mapping of indices to tokens.
 * @returns {string[]} - An array of decoded tokens.
 */
export function decodeTokens(indices, indexToToken) {
  if (!Array.isArray(indices)) {
    throw new Error('indices must be an array.');
  }
  if (typeof indexToToken !== 'object' || indexToToken === null) {
    throw new Error('indexToToken must be a non-null object.');
  }

  return indices.map(index => {
    if (!(index in indexToToken)) {
      throw new Error(`Index "${index}" not found in indexToToken.`);
    }
    return indexToToken[index];
  });
}
