/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_19
 * Name: ragContextRetriever
 * Purpose: Retrieves and processes only the most relevant context from long documents or conversations.
 * Description: Retrieves and ranks the most relevant context from documents using vector similarity and attention-based ranking.
 * Migrated: 2026-04-02T14:50:29.445Z
 */

// ragContextRetriever.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash-based identifier for a given string.
 * Useful for caching or indexing purposes.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash identifier.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Cosine similarity score.
 */
export function cosineSimilarity(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, value, index) => sum + value * vectorB[index], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, value) => sum + value ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, value) => sum + value ** 2, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Ranks documents based on their relevance to a query using vector similarity.
 * @param {Object[]} documents - Array of documents with embeddings.
 * @param {number[]} queryEmbedding - Embedding of the query.
 * @returns {Object[]} - Ranked documents with similarity scores.
 */
export function rankDocuments(documents, queryEmbedding) {
  return documents
    .map(doc => ({ ...doc, similarity: cosineSimilarity(doc.embedding, queryEmbedding) }))
    .sort((a, b) => b.similarity - a.similarity);
}

/**
 * Retrieves the most relevant context from a set of documents.
 * @param {Object[]} documents - Array of documents with embeddings.
 * @param {number[]} queryEmbedding - Embedding of the query.
 * @param {number} topN - Number of top relevant documents to retrieve.
 * @returns {Object[]} - Top N relevant documents.
 */
export function retrieveRelevantContext(documents, queryEmbedding, topN = 5) {
  const rankedDocuments = rankDocuments(documents, queryEmbedding);
  return rankedDocuments.slice(0, topN);
}

/**
 * Normalizes a vector to unit length.
 * @param {number[]} vector - Input vector.
 * @returns {number[]} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value ** 2, 0));
  return magnitude ? vector.map(value => value / magnitude) : vector;
}

/**
 * Converts text into a simple vector representation using character frequency.
 * This is a basic embedding generator for demonstration purposes.
 * @param {string} text - Input text.
 * @returns {number[]} - Vector representation of the text.
 */
export function generateTextEmbedding(text) {
  const charFrequency = {};
  for (const char of text.toLowerCase()) {
    if (char >= 'a' && char <= 'z') {
      charFrequency[char] = (charFrequency[char] || 0) + 1;
    }
  }
  const vector = Array.from({ length: 26 }, (_, i) => charFrequency[String.fromCharCode(97 + i)] || 0);
  return normalizeVector(vector);
}

/**
 * Example usage of the module.
 * Demonstrates how to retrieve relevant context from documents.
 */
export function exampleUsage() {
  const documents = [
    { id: 'doc1', text: 'Machine learning is fascinating.', embedding: generateTextEmbedding('Machine learning is fascinating.') },
    { id: 'doc2', text: 'Artificial intelligence is the future.', embedding: generateTextEmbedding('Artificial intelligence is the future.') },
    { id: 'doc3', text: 'JavaScript is a versatile language.', embedding: generateTextEmbedding('JavaScript is a versatile language.') }
  ];

  const query = 'I love learning about AI and ML.';
  const queryEmbedding = generateTextEmbedding(query);

  const relevantContext = retrieveRelevantContext(documents, queryEmbedding, 2);
  return relevantContext;
}