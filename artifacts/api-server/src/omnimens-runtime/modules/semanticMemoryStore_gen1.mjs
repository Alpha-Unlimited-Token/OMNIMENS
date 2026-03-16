/**
 * semanticMemoryStore.js
 *
 * A self-contained utility module for retaining and retrieving context efficiently using embeddings.
 * This module combines pgvector-like vector storage with cosine similarity search for intelligent context retrieval and summarization.
 * Designed for Node.js 20+ with no external dependencies.
 */

/**
 * Generates a normalized vector from input data.
 * @param {Array<number>} vector - The input vector.
 * @returns {Array<number>} - The normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) throw new Error("Cannot normalize a zero vector.");
  return vector.map((val) => val / magnitude);
}

/**
 * Calculates the cosine similarity between two vectors.
 * @param {Array<number>} vectorA - The first vector.
 * @param {Array<number>} vectorB - The second vector.
 * @returns {number} - The cosine similarity score (-1 to 1).
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must be of the same length.");
  }
  const dotProduct = vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val * val, 0));
  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error("Cannot calculate cosine similarity with a zero vector.");
  }
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Stores embeddings and associated metadata in memory.
 */
const memoryStore = [];

/**
 * Adds a new embedding to the memory store.
 * @param {Array<number>} embedding - The vector representation of the data.
 * @param {string} metadata - Associated metadata for the embedding.
 */
export function addEmbedding(embedding, metadata) {
  const normalizedEmbedding = normalizeVector(embedding);
  memoryStore.push({ embedding: normalizedEmbedding, metadata });
}

/**
 * Retrieves the most similar embeddings from the memory store.
 * @param {Array<number>} queryEmbedding - The query vector.
 * @param {number} topK - The number of top results to retrieve.
 * @returns {Array<{metadata: string, similarity: number}>} - The top K results with metadata and similarity scores.
 */
export function retrieveSimilar(queryEmbedding, topK = 5) {
  const normalizedQuery = normalizeVector(queryEmbedding);
  const similarities = memoryStore.map(({ embedding, metadata }) => {
    const similarity = cosineSimilarity(normalizedQuery, embedding);
    return { metadata, similarity };
  });
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

/**
 * Summarizes the memory store by aggregating metadata of the top matches.
 * @param {Array<number>} queryEmbedding - The query vector.
 * @param {number} topK - The number of top results to consider for summarization.
 * @returns {string} - A summary of the top matches' metadata.
 */
export function summarizeContext(queryEmbedding, topK = 5) {
  const topMatches = retrieveSimilar(queryEmbedding, topK);
  return topMatches.map(({ metadata }) => metadata).join("\n");
}

/**
 * Clears the memory store.
 */
export function clearMemoryStore() {
  memoryStore.length = 0;
}

/**
 * Exports the module's functions.
 */
export default {
  normalizeVector,
  cosineSimilarity,
  addEmbedding,
  retrieveSimilar,
  summarizeContext,
  clearMemoryStore
};