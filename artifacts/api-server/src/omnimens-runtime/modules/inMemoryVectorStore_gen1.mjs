/**
 * @module inMemoryVectorStore
 * @description A utility module for caching and retrieving embeddings using cosine similarity for short-term memory during runtime.
 */

/**
 * @typedef {Object} VectorStore
 * @property {Object<string, number[]>} store - Key-value store where keys are identifiers and values are embedding vectors.
 */

/**
 * @type {VectorStore}
 */
const vectorStore = { store: {} };

/**
 * Adds a vector to the store.
 * @param {string} key - The unique identifier for the vector.
 * @param {number[]} vector - The embedding vector to store.
 * @throws {Error} If the vector is not an array of numbers.
 */
export function addVector(key, vector) {
  if (!Array.isArray(vector) || !vector.every((v) => typeof v === 'number')) {
    throw new Error('Vector must be an array of numbers.');
  }
  vectorStore.store[key] = vector;
}

/**
 * Removes a vector from the store.
 * @param {string} key - The unique identifier for the vector.
 */
export function removeVector(key) {
  delete vectorStore.store[key];
}

/**
 * Retrieves the vector associated with a key.
 * @param {string} key - The unique identifier for the vector.
 * @returns {number[] | null} The vector if found, or null if not.
 */
export function getVector(key) {
  return vectorStore.store[key] || null;
}

/**
 * Calculates the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} The cosine similarity score.
 * @throws {Error} If the vectors are not of the same length or not arrays of numbers.
 */
function cosineSimilarity(vectorA, vectorB) {
  if (!Array.isArray(vectorA) || !Array.isArray(vectorB)) {
    throw new Error('Both inputs must be arrays.');
  }
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length.');
  }

  const dotProduct = vectorA.reduce((sum, val, index) => sum + val * vectorB[index], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Finds the most similar vector in the store based on cosine similarity.
 * @param {number[]} queryVector - The vector to compare against.
 * @returns {{ key: string, similarity: number } | null} The key and similarity score of the closest match, or null if the store is empty.
 * @throws {Error} If the query vector is not an array of numbers.
 */
export function findMostSimilar(queryVector) {
  if (!Array.isArray(queryVector) || !queryVector.every((v) => typeof v === 'number')) {
    throw new Error('Query vector must be an array of numbers.');
  }

  let closestMatch = null;
  let highestSimilarity = -Infinity;

  for (const [key, storedVector] of Object.entries(vectorStore.store)) {
    const similarity = cosineSimilarity(queryVector, storedVector);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      closestMatch = { key, similarity };
    }
  }

  return closestMatch;
}

/**
 * Clears all vectors from the store.
 */
export function clearStore() {
  vectorStore.store = {};
}