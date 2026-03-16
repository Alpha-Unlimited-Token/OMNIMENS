/**
 * @module inMemoryVectorStore
 * @description A utility module for fast semantic search and recall using in-memory vector embeddings.
 * Implements cosine similarity and k-nearest neighbors search for high-dimensional vectors.
 */

/**
 * Stores vectors and their associated metadata in memory.
 * @type {Map<string, {vector: number[], metadata: any}>}
 */
const vectorStore = new Map();

/**
 * Adds a vector and its associated metadata to the in-memory store.
 * @param {string} id - Unique identifier for the vector.
 * @param {number[]} vector - High-dimensional vector to store.
 * @param {any} metadata - Metadata associated with the vector.
 * @throws {Error} If the vector is not an array of numbers.
 */
export function addVector(id, vector, metadata = null) {
  if (!Array.isArray(vector) || !vector.every((v) => typeof v === 'number')) {
    throw new Error('Vector must be an array of numbers.');
  }
  vectorStore.set(id, { vector, metadata });
}

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} Cosine similarity value between -1 and 1.
 * @throws {Error} If vectors are not of the same length.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length.');
  }

  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b ** 2, 0));

  return dotProduct / (magnitudeA * magnitudeB || 1); // Avoid division by zero
}

/**
 * Finds the k-nearest neighbors to a given query vector.
 * @param {number[]} queryVector - The query vector.
 * @param {number} k - Number of nearest neighbors to retrieve.
 * @returns {Array<{id: string, similarity: number, metadata: any}>} List of nearest neighbors sorted by similarity.
 */
export function findKNearestNeighbors(queryVector, k) {
  if (!Array.isArray(queryVector) || !queryVector.every((v) => typeof v === 'number')) {
    throw new Error('Query vector must be an array of numbers.');
  }

  const similarities = Array.from(vectorStore.entries()).map(([id, { vector, metadata }]) => {
    return { id, similarity: cosineSimilarity(queryVector, vector), metadata };
  });

  return similarities
    .sort((a, b) => b.similarity - a.similarity) // Sort by descending similarity
    .slice(0, k); // Return top-k results
}

/**
 * Clears all vectors from the in-memory store.
 */
export function clearStore() {
  vectorStore.clear();
}

/**
 * Retrieves all stored vectors and their metadata.
 * @returns {Array<{id: string, vector: number[], metadata: any}>} List of all stored vectors.
 */
export function getAllVectors() {
  return Array.from(vectorStore.entries()).map(([id, { vector, metadata }]) => ({ id, vector, metadata }));
}

/**
 * Removes a vector by its unique identifier.
 * @param {string} id - Unique identifier of the vector to remove.
 * @returns {boolean} True if the vector was removed, false if not found.
 */
export function removeVector(id) {
  return vectorStore.delete(id);
}

/**
 * Finds the most similar vector to a given query vector.
 * @param {number[]} queryVector - The query vector.
 * @returns {{id: string, similarity: number, metadata: any} | null} The most similar vector or null if store is empty.
 */
export function findMostSimilar(queryVector) {
  const neighbors = findKNearestNeighbors(queryVector, 1);
  return neighbors.length > 0 ? neighbors[0] : null;
}