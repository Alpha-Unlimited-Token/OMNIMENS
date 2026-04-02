/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_8
 * Name: retrievalAugmentedGeneration
 * Purpose: Enhance language generation by integrating retrieved knowledge from OMNIMENS' memory into external LLM outputs.
 * Description: This module enables retrieval-augmented generation by integrating retrieved knowledge into prompts for language models using cosine similarity.
 * Migrated: 2026-04-02T14:21:19.475Z
 */

// retrievalAugmentedGeneration.mjs

import { createHash } from 'crypto';

/**
 * Computes cosine similarity between two vectors.
 * @param {number[]} vecA - First vector.
 * @param {number[]} vecB - Second vector.
 * @returns {number} - Cosine similarity score.
 */
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) throw new Error('Vectors must have the same length.');

  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));

  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Hashes a string using SHA-256 to create deterministic keys.
 * @param {string} input - Input string to hash.
 * @returns {string} - Hexadecimal hash.
 */
export function hashString(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Retrieves the most contextually relevant item from a knowledge base using cosine similarity.
 * @param {string[]} knowledgeBase - Array of knowledge strings.
 * @param {number[][]} embeddings - Array of precomputed vector embeddings for the knowledge base.
 * @param {number[]} queryEmbedding - Vector embedding of the query.
 * @returns {{ item: string, score: number }} - Closest matching item and similarity score.
 */
export function retrieveRelevantItem(knowledgeBase, embeddings, queryEmbedding) {
  if (knowledgeBase.length !== embeddings.length) throw new Error('Knowledge base and embeddings must have the same length.');

  let bestMatch = { item: null, score: -Infinity };

  for (let i = 0; i < embeddings.length; i++) {
    const score = cosineSimilarity(embeddings[i], queryEmbedding);
    if (score > bestMatch.score) {
      bestMatch = { item: knowledgeBase[i], score };
    }
  }

  return bestMatch;
}

/**
 * Constructs a contextually enriched prompt for a language model.
 * @param {string} query - User's query.
 * @param {string} context - Retrieved context to include in the prompt.
 * @returns {string} - Generated prompt.
 */
export function constructPrompt(query, context) {
  return `Using the following context, answer the query:

Context:
${context}

Query:
${query}`;
}

/**
 * Main function to perform retrieval-augmented generation.
 * @param {string[]} knowledgeBase - Array of knowledge strings.
 * @param {number[][]} embeddings - Array of precomputed vector embeddings for the knowledge base.
 * @param {number[]} queryEmbedding - Vector embedding of the query.
 * @param {string} query - User's query.
 * @returns {{ prompt: string, context: string, similarityScore: number }} - Enriched prompt and metadata.
 */
export function retrievalAugmentedGeneration(knowledgeBase, embeddings, queryEmbedding, query) {
  const { item: context, score: similarityScore } = retrieveRelevantItem(knowledgeBase, embeddings, queryEmbedding);
  const prompt = constructPrompt(query, context);

  return { prompt, context, similarityScore };
}

/**
 * Utility to normalize a vector.
 * @param {number[]} vector - Input vector.
 * @returns {number[]} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  return magnitude ? vector.map(val => val / magnitude) : vector;
}

/**
 * Generates a dummy embedding for a given string (for testing purposes).
 * @param {string} input - Input string.
 * @returns {number[]} - Dummy embedding vector.
 */
export function generateDummyEmbedding(input) {
  const hash = hashString(input);
  return Array.from(hash).slice(0, 16).map(char => char.charCodeAt(0) / 255);
}
