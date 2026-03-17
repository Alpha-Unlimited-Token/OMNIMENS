/**
 * @module contextCompression
 * @description Compresses long-term conversational context into embeddings for token-efficient memory using sentence encoding.
 */

/**
 * Encodes a given text input into a fixed-size embedding vector.
 * This is a simplified implementation of sentence encoding using statistical techniques.
 *
 * @param {string} text - The input text to encode.
 * @returns {number[]} - A fixed-size array representing the text embedding.
 */
export function encodeTextToEmbedding(text) {
  if (typeof text !== 'string' || text.trim() === '') {
    throw new Error('Input must be a non-empty string.');
  }

  const words = text.toLowerCase().split(/\s+/);
  const wordFrequencies = {};

  // Count word frequencies
  for (const word of words) {
    wordFrequencies[word] = (wordFrequencies[word] || 0) + 1;
  }

  // Generate a fixed-size embedding (e.g., 300 dimensions)
  const embeddingSize = 300;
  const embedding = new Array(embeddingSize).fill(0);

  Object.keys(wordFrequencies).forEach((word, index) => {
    const charSum = word.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const position = index % embeddingSize;
    embedding[position] += charSum * wordFrequencies[word];
  });

  // Normalize the embedding
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val ** 2, 0));
  return embedding.map(val => val / magnitude);
}

/**
 * Compresses a long conversational context into a single embedding vector.
 *
 * @param {string[]} contextArray - Array of strings representing the conversational context.
 * @returns {number[]} - A single fixed-size embedding vector representing the compressed context.
 */
export function compressContext(contextArray) {
  if (!Array.isArray(contextArray) || contextArray.some(item => typeof item !== 'string')) {
    throw new Error('Input must be an array of strings.');
  }

  const embeddings = contextArray.map(encodeTextToEmbedding);
  const embeddingSize = embeddings[0].length;
  const compressedEmbedding = new Array(embeddingSize).fill(0);

  // Aggregate embeddings by averaging
  for (const embedding of embeddings) {
    for (let i = 0; i < embeddingSize; i++) {
      compressedEmbedding[i] += embedding[i];
    }
  }

  return compressedEmbedding.map(val => val / contextArray.length);
}

/**
 * Stores and retrieves compressed embeddings in memory for token-efficient memory management.
 */
const memoryStore = new Map();

/**
 * Stores a compressed context embedding in memory.
 *
 * @param {string} key - A unique identifier for the context.
 * @param {number[]} embedding - The embedding to store.
 */
export function storeEmbedding(key, embedding) {
  if (typeof key !== 'string' || key.trim() === '') {
    throw new Error('Key must be a non-empty string.');
  }
  if (!Array.isArray(embedding) || embedding.some(val => typeof val !== 'number')) {
    throw new Error('Embedding must be an array of numbers.');
  }

  memoryStore.set(key, embedding);
}

/**
 * Retrieves a stored embedding from memory by its key.
 *
 * @param {string} key - The unique identifier for the context.
 * @returns {number[] | undefined} - The retrieved embedding or undefined if not found.
 */
export function retrieveEmbedding(key) {
  if (typeof key !== 'string' || key.trim() === '') {
    throw new Error('Key must be a non-empty string.');
  }

  return memoryStore.get(key);
}

/**
 * Clears all stored embeddings from memory.
 */
export function clearMemory() {
  memoryStore.clear();
}
