// memoryEmbeddingStore.js

/**
 * @module memoryEmbeddingStore
 * @description Module for storing and retrieving conversation history embeddings
 *              to enable long-term context reconstruction using cosine similarity.
 */

/**
 * Stores embeddings and their associated metadata.
 * @type {Map<string, {embedding, metadata}>}
 */
const embeddingStore = new Map();

/**
 * Calculates the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The cosine similarity between the two vectors.
 */
function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length.');
  }

  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Adds an embedding to the store.
 * @param {string} id - A unique identifier for the embedding.
 * @param {number[]} embedding - The embedding vector to store.
 * @param {object} metadata - Additional metadata associated with the embedding.
 */
function addEmbedding(id, embedding, metadata = {}) {
  if (!Array.isArray(embedding) || embedding.some(isNaN)) {
    throw new Error('Embedding must be an array of numbers.');
  }

  embeddingStore.set(id, { embedding, metadata });
}

/**
 * Retrieves the most relevant embeddings based on cosine similarity.
 * @param {number[]} queryEmbedding - The query embedding vector.
 * @param {number} topK - The number of top results to retrieve.
 * @returns {Array<{id, similarity, metadata}>} - The top K most relevant embeddings.
 */
function retrieveRelevantEmbeddings(queryEmbedding, topK = 5) {
  if (!Array.isArray(queryEmbedding) || queryEmbedding.some(isNaN)) {
    throw new Error('Query embedding must be an array of numbers.');
  }

  const results = [];

  for (const [id, { embedding, metadata }] of embeddingStore.entries()) {
    const similarity = cosineSimilarity(queryEmbedding, embedding);
    results.push({ id, similarity, metadata });
  }

  // Sort results by similarity in descending order and return the top K
  return results.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
}

/**
 * Clears all embeddings from the store.
 */
function clearStore() {
  embeddingStore.clear();
}

/**
 * Retrieves the current size of the embedding store.
 * @returns {number} - The number of embeddings in the store.
 */
function getStoreSize() {
  return embeddingStore.size;
}

export { addEmbedding, retrieveRelevantEmbeddings, clearStore, getStoreSize };