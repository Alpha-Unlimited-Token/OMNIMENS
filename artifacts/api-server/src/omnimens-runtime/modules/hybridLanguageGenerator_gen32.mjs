/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hybridLanguageGenerator
 * Written: 2026-04-02T15:15:49.276Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hybridLanguageGenerator.mjs

import { createHash } from 'crypto';

/**
 * Generate vector embeddings for text using a simplified hashing approach.
 * @param {string} text - Input text to generate embeddings for.
 * @returns {number[]} - Array of numerical embeddings.
 */
export function generateEmbeddings(text) {
  const hash = createHash('sha256').update(text).digest('hex');
  const embeddings = [];
  for (let i = 0; i < hash.length; i += 8) {
    embeddings.push(parseInt(hash.slice(i, i + 8), 16));
  }
  return embeddings;
}

/**
 * Calculate cosine similarity between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Cosine similarity score.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length.');
  }

  const dotProduct = vectorA.reduce((sum, val, index) => sum + val * vectorB[index], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero.
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Generate conversational output based on input text and similarity scoring.
 * @param {string} inputText - Input text for generating response.
 * @param {string[]} knowledgeBase - Array of texts to compare against.
 * @returns {string} - Most relevant response from the knowledge base.
 */
export function generateResponse(inputText, knowledgeBase) {
  const inputEmbeddings = generateEmbeddings(inputText);
  let bestMatch = null;
  let highestSimilarity = -Infinity;

  for (const text of knowledgeBase) {
    const textEmbeddings = generateEmbeddings(text);
    const similarity = cosineSimilarity(inputEmbeddings, textEmbeddings);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = text;
    }
  }

  return bestMatch || 'No relevant match found.';
}

/**
 * Generate embeddings for multiple texts in batch.
 * @param {string[]} texts - Array of texts to process.
 * @returns {number[][]} - Array of embeddings for each text.
 */
export function batchGenerateEmbeddings(texts) {
  return texts.map(text => generateEmbeddings(text));
}

/**
 * Find the most similar text from a batch using cosine similarity.
 * @param {string} inputText - Input text for comparison.
 * @param {string[]} texts - Array of texts to compare against.
 * @returns {string} - Most similar text.
 */
export function findMostSimilarText(inputText, texts) {
  const inputEmbeddings = generateEmbeddings(inputText);
  const embeddingsBatch = batchGenerateEmbeddings(texts);

  let bestMatch = null;
  let highestSimilarity = -Infinity;

  embeddingsBatch.forEach((embeddings, index) => {
    const similarity = cosineSimilarity(inputEmbeddings, embeddings);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = texts[index];
    }
  });

  return bestMatch || 'No relevant match found.';
}
