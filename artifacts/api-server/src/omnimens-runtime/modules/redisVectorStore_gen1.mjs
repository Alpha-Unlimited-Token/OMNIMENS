/**
 * @module redisVectorStore
 * @description This module provides an in-memory vector embedding storage and similarity search mechanism using cosine similarity.
 * @author OMNIMENS
 */

/**
 * Stores vector embeddings in memory.
 * @type {Map<string, number[]>}
 */
const vectorStore = new Map();

/**
 * Adds a vector embedding to the store.
 * @param {string} id - Unique identifier for the vector.
 * @param {number[]} vector - The vector embedding to store.
 * @throws {Error} If the vector is not a valid array of numbers.
 */
export function addVector(id, vector) {
  if (!Array.isArray(vector) || !vector.every((num) => typeof num === 'number')) {
    throw new Error('Vector must be an array of numbers.');
  }
  vectorStore.set(id, vector);
}

/**
 * Removes a vector embedding from the store.
 * @param {string} id - Unique identifier for the vector to remove.
 * @returns {boolean} True if the vector was removed, false if it did not exist.
 */
export function removeVector(id) {
  return vectorStore.delete(id);
}

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} The cosine similarity between the two vectors.
 * @throws {Error} If the vectors are not of the same length or are invalid.
 */
function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length.');
  }

  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Handle edge case where one of the vectors has zero magnitude.
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Finds the most similar vectors to a given query vector.
 * @param {number[]} queryVector - The query vector.
 * @param {number} topK - The number of top similar vectors to return.
 * @returns {Array<{id: string, similarity: number}>} An array of objects containing vector IDs and their similarity scores.
 * @throws {Error} If the query vector is invalid.
 */
export function searchSimilarVectors(queryVector, topK = 5) {
  if (!Array.isArray(queryVector) || !queryVector.every((num) => typeof num === 'number')) {
    throw new Error('Query vector must be an array of numbers.');
  }

  const similarities = [];

  for (const [id, vector] of vectorStore.entries()) {
    const similarity = cosineSimilarity(queryVector, vector);
    similarities.push({ id, similarity });
  }

  return similarities
    .sort((a, b) => b.similarity - a.similarity) // Sort by descending similarity.
    .slice(0, topK); // Return the top K results.
}

/**
 * Clears all vectors from the store.
 */
export function clearStore() {
  vectorStore.clear();
}

/**
 * Retrieves the current size of the vector store.
 * @returns {number} The number of vectors stored.
 */
export function getStoreSize() {
  return vectorStore.size;
}