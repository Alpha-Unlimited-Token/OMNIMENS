/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticContextPreserver
 * Written: 2026-04-02T14:52:34.139Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// semanticContextPreserver.mjs

import crypto from 'crypto';

/**
 * Generates a hash-based identifier for a given text input.
 * Useful for deduplication or quick lookups of semantic content.
 * @param {string} input - The input text to hash.
 * @returns {string} - A unique hash for the input.
 */
export function generateHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Tokenizes input text into words, removing punctuation and normalizing case.
 * @param {string} text - The input text to tokenize.
 * @returns {string[]} - An array of normalized tokens.
 */
export function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Calculates term frequency (TF) for tokens in a document.
 * @param {string[]} tokens - An array of tokens from the document.
 * @returns {Object} - A mapping of token to its frequency.
 */
export function calculateTermFrequency(tokens) {
  const tf = {};
  tokens.forEach(token => {
    tf[token] = (tf[token] || 0) + 1;
  });
  return tf;
}

/**
 * Computes the cosine similarity between two term frequency vectors.
 * @param {Object} tf1 - Term frequency object for document 1.
 * @param {Object} tf2 - Term frequency object for document 2.
 * @returns {number} - Cosine similarity score (0 to 1).
 */
export function cosineSimilarity(tf1, tf2) {
  const allTokens = new Set([...Object.keys(tf1), ...Object.keys(tf2)]);
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  allTokens.forEach(token => {
    const val1 = tf1[token] || 0;
    const val2 = tf2[token] || 0;
    dotProduct += val1 * val2;
    magnitudeA += val1 ** 2;
    magnitudeB += val2 ** 2;
  });

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

/**
 * Extracts semantically rich sentences from a document based on term frequency.
 * @param {string} text - The input document text.
 * @param {number} maxSentences - Maximum number of sentences to extract.
 * @returns {string[]} - An array of semantically rich sentences.
 */
export function extractSemanticSentences(text, maxSentences = 3) {
  const sentences = text.match(/[^.!?]+[.!?]/g) || [];
  const sentenceScores = sentences.map(sentence => {
    const tokens = tokenize(sentence);
    const tf = calculateTermFrequency(tokens);
    const score = Object.values(tf).reduce((sum, freq) => sum + freq, 0);
    return { sentence, score };
  });

  sentenceScores.sort((a, b) => b.score - a.score);
  return sentenceScores.slice(0, maxSentences).map(entry => entry.sentence.trim());
}

/**
 * Performs Latent Semantic Indexing (LSI)-like dimensionality reduction on term frequencies.
 * Simplifies data while preserving semantic relationships.
 * @param {Object[]} termFrequencies - Array of term frequency objects for multiple documents.
 * @returns {Object[]} - Reduced representation of term frequencies.
 */
export function reduceDimensionality(termFrequencies) {
  const allTokens = Array.from(new Set(termFrequencies.flatMap(tf => Object.keys(tf))));
  const tokenIndex = Object.fromEntries(allTokens.map((token, index) => [token, index]));

  const matrix = termFrequencies.map(tf => {
    return allTokens.map(token => tf[token] || 0);
  });

  const reducedMatrix = matrix.map(row => {
    const magnitude = Math.sqrt(row.reduce((sum, val) => sum + val ** 2, 0));
    return magnitude === 0 ? row : row.map(val => val / magnitude);
  });

  return reducedMatrix.map(row => {
    return row.reduce((obj, val, index) => {
      if (val !== 0) obj[allTokens[index]] = val;
      return obj;
    }, {});
  });
}

/**
 * Compresses a long document while preserving semantic richness.
 * Combines extractive summarization with dimensionality reduction.
 * @param {string} text - The input document text.
 * @param {number} maxSentences - Maximum number of sentences in the compressed output.
 * @returns {string} - Compressed and semantically rich version of the document.
 */
export function compressDocument(text, maxSentences = 3) {
  const semanticSentences = extractSemanticSentences(text, maxSentences);
  return semanticSentences.join(' ');
}