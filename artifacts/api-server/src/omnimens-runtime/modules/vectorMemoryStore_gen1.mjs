// vectorMemoryStore.js

/**
 * @module vectorMemoryStore
 * @description Provides fast, in-memory storage and retrieval of vector embeddings using nearest neighbor search.
 * Designed for dynamic context management and efficient embedding indexing.
 */

/**
 * Stores vector embeddings in memory and allows efficient nearest neighbor search.
 * @type {Map<string, number[]>}
 */
const embeddingStore = new Map();

/**
 * Adds a new embedding to the store.
 * @param {string} id - Unique identifier for the embedding.
 * @param {number[]} vector - The embedding vector.
 * @throws {Error} Throws if the vector is not a valid array of numbers.
 */
export function addEmbedding(id, vector) {
  if (!Array.isArray(vector) || vector.some(v => typeof v !== 'number')) {
    throw new Error('Vector must be an array of numbers.');
  }
  embeddingStore.set(id, vector);
}

/**
 * Finds the nearest neighbor to a given query vector.
 * @param {number[]} queryVector - The vector to search for nearest neighbors.
 * @returns {{id: string, distance: number}[]} An array of nearest neighbors sorted by distance.
 * @throws {Error} Throws if the query vector is not a valid array of numbers.
 */
export function findNearestNeighbors(queryVector) {
  if (!Array.isArray(queryVector) || queryVector.some(v => typeof v !== 'number')) {
    throw new Error('Query vector must be an array of numbers.');
  }

  const results = [];

  for (const [id, vector] of embeddingStore.entries()) {
    if (vector.length !== queryVector.length) {
      continue; // Skip vectors of mismatched dimensions.
    }

    const distance = calculateEuclideanDistance(queryVector, vector);
    results.push({ id, distance });
  }

  // Sort results by ascending distance.
  return results.sort((a, b) => a.distance - b.distance);
}

/**
 * Clears all embeddings from the store.
 */
export function clearEmbeddings() {
  embeddingStore.clear();
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} The Euclidean distance.
 */
function calculateEuclideanDistance(vectorA, vectorB) {
  return Math.sqrt(vectorA.reduce((sum, val, index) => sum + Math.pow(val - vectorB[index], 2), 0));
}

/**
 * Retrieves all stored embeddings.
 * @returns {Map<string, number[]>} A map of all embeddings.
 */
export function getAllEmbeddings() {
  return new Map(embeddingStore);
}

/**
 * Retrieves an embedding by its ID.
 * @param {string} id - The ID of the embedding to retrieve.
 * @returns {number[] | undefined} The embedding vector, or undefined if not found.
 */
export function getEmbeddingById(id) {
  return embeddingStore.get(id);
}

/**
 * Removes an embedding by its ID.
 * @param {string} id - The ID of the embedding to remove.
 * @returns {boolean} True if the embedding was removed, false if not found.
 */
export function removeEmbeddingById(id) {
  return embeddingStore.delete(id);
}