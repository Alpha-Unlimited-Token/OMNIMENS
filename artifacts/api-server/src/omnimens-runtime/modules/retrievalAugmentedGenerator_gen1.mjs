/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_3
 * Name: retrievalAugmentedGenerator
 * Purpose: Augments OMNIMENS' neural cognition engine with external document retrieval for enhanced natural language generation.
 * Description: Provides utilities for retrieval-augmented generation, including vector similarity, extractive summarization, and chain-of-thought reasoning.
 * Migrated: 2026-04-02T14:21:19.475Z
 */

// retrievalAugmentedGenerator.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash for a given string. Useful for caching or unique identification.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Computes cosine similarity between two vectors.
 * @param {number[]} vec1 - First vector.
 * @param {number[]} vec2 - Second vector.
 * @returns {number} - Cosine similarity score (-1 to 1).
 */
export function cosineSimilarity(vec1, vec2) {
  if (vec1.length !== vec2.length) throw new Error('Vectors must have the same length.');

  const dotProduct = vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, v) => sum + v ** 2, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, v) => sum + v ** 2, 0));

  return magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0;
}

/**
 * Extracts the most relevant sentences from a document based on a query.
 * @param {string} document - The full text document.
 * @param {string} query - The query string.
 * @param {number} maxSentences - Maximum number of sentences to extract.
 * @returns {string[]} - Array of relevant sentences.
 */
export function extractRelevantSentences(document, query, maxSentences = 3) {
  const sentences = document.match(/[^.!?]+[.!?]/g) || [];
  const queryWords = query.toLowerCase().split(/\s+/);

  const scoredSentences = sentences.map(sentence => {
    const sentenceWords = sentence.toLowerCase().split(/\s+/);
    const commonWords = sentenceWords.filter(word => queryWords.includes(word));
    return { sentence, score: commonWords.length };
  });

  scoredSentences.sort((a, b) => b.score - a.score);
  return scoredSentences.slice(0, maxSentences).map(entry => entry.sentence.trim());
}

/**
 * Combines chain-of-thought reasoning with retrieved context for enriched generation.
 * @param {string} query - The input query.
 * @param {string[]} documents - Array of external documents.
 * @returns {string} - A contextually enriched response.
 */
export function generateAugmentedResponse(query, documents) {
  // Step 1: Extract relevant sentences from each document
  const relevantSentences = documents.flatMap(doc => extractRelevantSentences(doc, query));

  // Step 2: Combine extracted context with chain-of-thought reasoning
  const context = relevantSentences.join(' ');
  const response = `Based on the query: "${query}", and the following context: "${context}", here is the reasoning: `;

  // Step 3: Simulate chain-of-thought reasoning (simple example)
  const reasoning = `The query relates to ${query.split(' ').length} key concepts, and the context provides ${relevantSentences.length} supporting points.`;

  return response + reasoning;
}

/**
 * Normalizes a vector to unit length.
 * @param {number[]} vector - The input vector.
 * @returns {number[]} - The normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v ** 2, 0));
  return magnitude ? vector.map(v => v / magnitude) : vector;
}

/**
 * Converts a string into a simple vector representation based on character codes.
 * @param {string} text - The input text.
 * @returns {number[]} - Vector representation of the text.
 */
export function textToVector(text) {
  return Array.from(text).map(char => char.charCodeAt(0));
}

/**
 * Finds the most similar document to a query using vector similarity.
 * @param {string} query - The query string.
 * @param {string[]} documents - Array of documents to search.
 * @returns {string} - The most similar document.
 */
export function findMostSimilarDocument(query, documents) {
  const queryVector = normalizeVector(textToVector(query));

  let bestMatch = { document: '', similarity: -Infinity };
  for (const doc of documents) {
    const docVector = normalizeVector(textToVector(doc));
    const similarity = cosineSimilarity(queryVector, docVector);
    if (similarity > bestMatch.similarity) {
      bestMatch = { document: doc, similarity };
    }
  }

  return bestMatch.document;
}
