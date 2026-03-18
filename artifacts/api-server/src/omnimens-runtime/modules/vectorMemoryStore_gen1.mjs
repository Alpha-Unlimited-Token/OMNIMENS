/**
 * @module vectorMemoryStore
 * @description Provides an in-memory store for embedding vectors with fast nearest neighbor search using cosine similarity.
 */

const { createServer } = require('net');

/**
 * @typedef {Object} VectorStore
 * @property {Map<string, number[]>} store - A map of unique keys to embedding vectors.
 * @property {number} vectorDimension - The dimension of embedding vectors stored.
 */

/**
 * Creates a new vector memory store.
 * @param {number} vectorDimension - The dimensionality of the embedding vectors.
 * @returns {VectorStore} The initialized vector store.
 */
function createVectorStore(vectorDimension) {
  if (!Number.isInteger(vectorDimension) || vectorDimension <= 0) {
    throw new Error('vectorDimension must be a positive integer.');
  }

  return {
    store: new Map(),
    vectorDimension
  };
}

/**
 * Adds a vector to the store.
 * @param {VectorStore} vectorStore - The vector store instance.
 * @param {string} key - A unique identifier for the vector.
 * @param {number[]} vector - The embedding vector to store.
 * @throws Will throw an error if the vector dimension does not match the store's dimension.
 */
function addVector(vectorStore, key, vector) {
  if (vector.length !== vectorStore.vectorDimension) {
    throw new Error(`Vector dimension mismatch. Expected ${vectorStore.vectorDimension}, got ${vector.length}.`);
  }

  vectorStore.store.set(key, vector);
}

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} The cosine similarity between the vectors.
 */
function cosineSimilarity(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Finds the nearest neighbors to a given vector in the store.
 * @param {VectorStore} vectorStore - The vector store instance.
 * @param {number[]} queryVector - The query vector.
 * @param {number} k - The number of nearest neighbors to retrieve.
 * @returns {Array<{key: string, similarity: number}>} The k nearest neighbors with their similarity scores.
 */
function findNearestNeighbors(vectorStore, queryVector, k) {
  if (queryVector.length !== vectorStore.vectorDimension) {
    throw new Error(`Query vector dimension mismatch. Expected ${vectorStore.vectorDimension}, got ${queryVector.length}.`);
  }

  const similarities = Array.from(vectorStore.store.entries()).map(([key, vector]) => ({
    key,
    similarity: cosineSimilarity(queryVector, vector)
  }));

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, k);
}

/**
 * Starts a simple TCP server for querying the vector store.
 * @param {VectorStore} vectorStore - The vector store instance.
 * @param {number} port - The port number to listen on.
 */
function startServer(vectorStore, port) {
  const server = createServer((socket) => {
    socket.on('data', (data) => {
      try {
        const { queryVector, k } = JSON.parse(data.toString());
        const neighbors = findNearestNeighbors(vectorStore, queryVector, k);
        socket.write(JSON.stringify(neighbors));
      } catch (err) {
        socket.write(JSON.stringify({ error: err.message }));
      }
    });
  });

  server.listen(port, () => {
    console.log(`Vector memory store server running on port ${port}`);
  });
}

module.exports = {
  createVectorStore,
  addVector,
  findNearestNeighbors,
  startServer
};