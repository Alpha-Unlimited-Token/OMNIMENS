/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextReExpansionManager
 * Written: 2026-04-02T14:10:04.825Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextReExpansionManager.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash from a given string for efficient context tracking.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash of the input.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Summarizes a block of text hierarchically by splitting into sentences and scoring importance.
 * @param {string} text - The input text to summarize.
 * @param {number} maxSentences - The maximum number of sentences to retain.
 * @returns {string} - A summarized version of the input text.
 */
export function hierarchicalSummarization(text, maxSentences = 5) {
  const sentences = text.match(/[^.!?]+[.!?]/g) || [];
  if (sentences.length <= maxSentences) return text;

  const importanceScores = sentences.map((sentence, index) => ({
    sentence,
    score: sentence.length + index * 0.1 // Basic scoring: length + positional bias
  }));

  importanceScores.sort((a, b) => b.score - a.score);
  return importanceScores.slice(0, maxSentences).map(item => item.sentence).join(' ');
}

/**
 * Expands a compressed context using local embeddings and cosine similarity.
 * @param {string[]} compressedContext - Array of compressed context strings.
 * @param {string} query - The query to match against.
 * @returns {string} - The most relevant expanded context.
 */
export function reExpandContext(compressedContext, query) {
  const embeddings = compressedContext.map(text => ({
    text,
    vector: text.split('').map(char => char.charCodeAt(0) % 256) // Simple char-based embedding
  }));

  const queryVector = query.split('').map(char => char.charCodeAt(0) % 256);

  const cosineSimilarity = (vecA, vecB) => {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * (vecB[i] || 0), 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB || 1);
  };

  const scoredEmbeddings = embeddings.map(({ text, vector }) => ({
    text,
    score: cosineSimilarity(vector, queryVector)
  }));

  scoredEmbeddings.sort((a, b) => b.score - a.score);
  return scoredEmbeddings[0]?.text || '';
}

/**
 * Manages context reconstruction by combining summarization and re-expansion.
 * @param {string[]} contextChunks - Array of context chunks.
 * @param {string} query - The query to refine the context for.
 * @param {number} maxSummarySentences - Max sentences for summarization.
 * @returns {string} - The reconstructed context.
 */
export function reconstructContext(contextChunks, query, maxSummarySentences = 5) {
  const summarizedChunks = contextChunks.map(chunk => hierarchicalSummarization(chunk, maxSummarySentences));
  return reExpandContext(summarizedChunks, query);
}

/**
 * Utility function to split large text into manageable chunks.
 * @param {string} text - The input text to split.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @returns {string[]} - An array of text chunks.
 */
export function splitTextIntoChunks(text, chunkSize = 500) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}
