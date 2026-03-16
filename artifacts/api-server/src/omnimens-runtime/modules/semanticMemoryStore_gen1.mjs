/**
 * @module semanticMemoryStore
 * @description A utility module for maintaining and retrieving long-term conversational context using an in-memory vector store.
 */

/**
 * Generates a normalized vector from a given string by hashing its characters and normalizing the result.
 * @param {string} input - The input string to be converted into a vector.
 * @returns {number[]} A normalized vector representation of the input string.
 */
function generateVector(input) {
  const vector = Array(128).fill(0);
  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i) % 128;
    vector[charCode] += 1;
  }
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  return vector.map((val) => val / magnitude);
}

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} The cosine similarity between the two vectors.
 */
function cosineSimilarity(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Class representing a semantic memory store.
 */
class SemanticMemoryStore {
  constructor() {
    /** @type {Map<string, {vector: number[], data: any}>} */
    this.store = new Map();
  }

  /**
   * Adds an entry to the memory store.
   * @param {string} key - The unique key for the entry.
   * @param {string} text - The text data to store.
   * @param {any} metadata - Additional metadata associated with the entry.
   */
  add(key, text, metadata = null) {
    const vector = generateVector(text);
    this.store.set(key, { vector, data: { text, metadata } });
  }

  /**
   * Retrieves the most semantically similar entry to the given query.
   * @param {string} query - The input query string.
   * @param {number} threshold - The similarity threshold (0 to 1).
   * @returns {{key: string, similarity: number, data: any} | null} The closest match or null if no match exceeds the threshold.
   */
  retrieve(query, threshold = 0.7) {
    const queryVector = generateVector(query);
    let bestMatch = null;
    let highestSimilarity = -Infinity;

    for (const [key, { vector, data }] of this.store.entries()) {
      const similarity = cosineSimilarity(queryVector, vector);
      if (similarity > highestSimilarity && similarity >= threshold) {
        highestSimilarity = similarity;
        bestMatch = { key, similarity, data };
      }
    }

    return bestMatch;
  }

  /**
   * Clears all entries in the memory store.
   */
  clear() {
    this.store.clear();
  }

  /**
   * Removes a specific entry by its key.
   * @param {string} key - The key of the entry to remove.
   * @returns {boolean} True if the entry was successfully removed, false otherwise.
   */
  remove(key) {
    return this.store.delete(key);
  }
}

export { SemanticMemoryStore, generateVector, cosineSimilarity };