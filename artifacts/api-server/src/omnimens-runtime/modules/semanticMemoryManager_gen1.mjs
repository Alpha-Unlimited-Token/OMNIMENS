/**
 * @module semanticMemoryManager
 * @description Implements fast semantic search and reasoning over embeddings using cosine similarity.
 */

/**
 * Stores vector embeddings in memory for fast semantic search.
 *
 * @type {Object<string, number[]>}
 */
const embeddingStore = {};

/**
 * Adds a new embedding to the store.
 *
 * @param {string} key - Unique identifier for the embedding.
 * @param {number[]} vector - The embedding vector.
 * @throws {Error} If the vector is not an array of numbers.
 */
export function addEmbedding(key, vector) {
  if (!Array.isArray(vector) || !vector.every((val) => typeof val === 'number')) {
    throw new Error('Vector must be an array of numbers.');
  }
  embeddingStore[key] = vector;
}

/**
 * Computes the cosine similarity between two vectors.
 *
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} Cosine similarity score.
 * @throws {Error} If vectors are not of the same length.
 */
function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length.');
  }

  const dotProduct = vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Finds the most similar embedding in the store to the given query vector.
 *
 * @param {number[]} queryVector - The query embedding vector.
 * @returns {{ key: string, similarity: number } | null} Most similar embedding and its similarity score, or null if the store is empty.
 */
export function findMostSimilar(queryVector) {
  if (Object.keys(embeddingStore).length === 0) {
    return null;
  }

  let bestMatch = { key: null, similarity: -Infinity };

  for (const [key, storedVector] of Object.entries(embeddingStore)) {
    const similarity = cosineSimilarity(queryVector, storedVector);
    if (similarity > bestMatch.similarity) {
      bestMatch = { key, similarity };
    }
  }

  return bestMatch;
}

/**
 * Clears all embeddings from the store.
 */
export function clearEmbeddings() {
  for (const key in embeddingStore) {
    delete embeddingStore[key];
  }
}

/**
 * Retrieves all embeddings currently stored.
 *
 * @returns {Object<string, number[]>} All embeddings in the store.
 */
export function getAllEmbeddings() {
  return { ...embeddingStore };
}

/**
 * Removes a specific embedding by its key.
 *
 * @param {string} key - The key of the embedding to remove.
 * @returns {boolean} True if the embedding was removed, false if it did not exist.
 */
export function removeEmbedding(key) {
  if (key in embeddingStore) {
    delete embeddingStore[key];
    return true;
  }
  return false;
}