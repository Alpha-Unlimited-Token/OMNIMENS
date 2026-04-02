/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_36
 * Name: retrievalAugmentedContextManager
 * Purpose: Dynamically fetch and integrate relevant context from the persistence layer during reasoning to enhance long-range dependencies.
 * Description: A utility module for retrieval-augmented context management using k-NN, summarization, and vector similarity.
 * Migrated: 2026-04-02T14:50:29.442Z
 */

// retrievalAugmentedContextManager.mjs
import { createHash } from 'crypto';

/**
 * Hashes a string input to create a deterministic key for indexing.
 * Useful for creating unique keys for context storage.
 * @param {string} input - The string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function generateHashKey(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Computes cosine similarity between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Cosine similarity score between -1 and 1.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length');
  }

  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Performs approximate k-NN search to find the most relevant context.
 * @param {Array<{id: string, vector: number[]}>} contextVectors - Array of stored context vectors.
 * @param {number[]} queryVector - Query vector for similarity search.
 * @param {number} k - Number of nearest neighbors to retrieve.
 * @returns {Array<{id: string, similarity: number}>} - Sorted array of k nearest contexts with similarity scores.
 */
export function approximateKNN(contextVectors, queryVector, k = 5) {
  const scoredContexts = contextVectors.map(({ id, vector }) => ({
    id,
    similarity: cosineSimilarity(vector, queryVector)
  }));

  return scoredContexts
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, k);
}

/**
 * Hierarchically summarizes a large text input into smaller chunks.
 * @param {string} text - The input text to summarize.
 * @param {number} chunkSize - Maximum size of each chunk.
 * @returns {string[]} - Array of summarized text chunks.
 */
export function hierarchicalSummarization(text, chunkSize = 500) {
  const sentences = text.split('. ');
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
    currentChunk += sentence + '. ';
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Merges relevant context into working memory based on similarity.
 * @param {string} query - Query text to retrieve relevant context.
 * @param {Array<{id: string, vector: number[], content: string}>} contextStore - Stored context with vectors and content.
 * @param {function(string): number[]} vectorizer - Function to convert text into a vector.
 * @param {number} k - Number of relevant contexts to retrieve.
 * @returns {string} - Merged context and query as a single string.
 */
export function mergeRelevantContext(query, contextStore, vectorizer, k = 5) {
  const queryVector = vectorizer(query);
  const nearestContexts = approximateKNN(
    contextStore.map(({ id, vector }) => ({ id, vector })),
    queryVector,
    k
  );

  const relevantContent = nearestContexts
    .map(({ id }) => contextStore.find(ctx => ctx.id === id)?.content)
    .filter(Boolean)
    .join('\n');

  return `${relevantContent}\nQuery:\n${query}`;
}

/**
 * Example vectorizer function (dummy implementation for demonstration).
 * Converts text into a simple vector based on character codes.
 * Replace with a more sophisticated embedding model for real use.
 * @param {string} text - Input text to vectorize.
 * @returns {number[]} - Vector representation of the text.
 */
export function simpleVectorizer(text) {
  return text.split('').map(char => char.charCodeAt(0) % 256);
}
