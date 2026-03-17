// semanticMemoryStore.js

/**
 * @module semanticMemoryStore
 * @description A utility module for maintaining and retrieving persistent semantic memory across sessions.
 * Implements approximate nearest neighbor search using a custom vector store.
 */

/**
 * @typedef {Object} MemoryEntry
 * @property {string} id - Unique identifier for the memory entry.
 * @property {number[]} vector - Semantic vector representing the memory entry.
 * @property {string} data - Associated data for the memory entry.
 */

/**
 * @typedef {Object} SearchResult
 * @property {string} id - Identifier of the matched memory entry.
 * @property {number} similarity - Similarity score between the query and the matched entry.
 * @property {string} data - Associated data of the matched memory entry.
 */

/**
 * Internal vector store to persist semantic memory entries.
 * @type {MemoryEntry[]}
 */
const vectorStore = [];

/**
 * Adds a new memory entry to the vector store.
 * @param {string} id - Unique identifier for the memory entry.
 * @param {number[]} vector - Semantic vector representing the memory entry.
 * @param {string} data - Associated data for the memory entry.
 * @throws {Error} If the vector is not an array of numbers.
 */
function addMemory(id, vector, data) {
  if (!Array.isArray(vector) || !vector.every((v) => typeof v === 'number')) {
    throw new Error('Vector must be an array of numbers.');
  }
  vectorStore.push({ id, vector, data });
}

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} Cosine similarity score.
 */
function cosineSimilarity(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * (vectorB[i] || 0), 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Searches the vector store for the most similar memory entries to the given query vector.
 * @param {number[]} queryVector - Semantic vector representing the query.
 * @param {number} topK - Number of top results to return.
 * @returns {SearchResult[]} Array of top matching memory entries sorted by similarity.
 * @throws {Error} If the query vector is not an array of numbers.
 */
function searchMemory(queryVector, topK = 1) {
  if (!Array.isArray(queryVector) || !queryVector.every((v) => typeof v === 'number')) {
    throw new Error('Query vector must be an array of numbers.');
  }

  const results = vectorStore.map((entry) => {
    const similarity = cosineSimilarity(queryVector, entry.vector);
    return { id: entry.id, similarity, data: entry.data };
  });

  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

/**
 * Clears all memory entries in the vector store.
 */
function clearMemory() {
  vectorStore.length = 0;
}

/**
 * Exports the module's functions.
 */
export { addMemory, searchMemory, clearMemory };
