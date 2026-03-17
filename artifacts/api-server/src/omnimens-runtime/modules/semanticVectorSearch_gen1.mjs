/**
 * @module semanticVectorSearch
 * @description Provides functionality to store and retrieve embeddings for semantic similarity search using PostgreSQL.
 * @author OMNIMENS
 */

/**
 * Imports required built-in Node.js modules.
 */
const { Client } = require('pg');
const crypto = require('crypto');

/**
 * Connects to a PostgreSQL database.
 * @param {string} connectionString - PostgreSQL connection string.
 * @returns {Promise<Client>} A connected PostgreSQL client instance.
 */
async function connectToDatabase(connectionString) {
  const client = new Client({ connectionString });
  await client.connect();
  return client;
}

/**
 * Initializes the embeddings table in the PostgreSQL database.
 * @param {Client} client - A connected PostgreSQL client instance.
 * @returns {Promise<void>} Resolves when the table is created.
 */
async function initializeTable(client) {
  const query = `
    CREATE TABLE IF NOT EXISTS embeddings (
      id SERIAL PRIMARY KEY,
      vector JSONB NOT NULL,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await client.query(query);
}

/**
 * Inserts a new embedding into the database.
 * @param {Client} client - A connected PostgreSQL client instance.
 * @param {number[]} vector - The embedding vector to store.
 * @param {Object} metadata - Optional metadata associated with the vector.
 * @returns {Promise<number>} The ID of the inserted embedding.
 */
async function insertEmbedding(client, vector, metadata = {}) {
  const query = `
    INSERT INTO embeddings (vector, metadata)
    VALUES ($1, $2)
    RETURNING id;
  `;
  const result = await client.query(query, [JSON.stringify(vector), JSON.stringify(metadata)]);
  return result.rows[0].id;
}

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} The cosine similarity between the two vectors.
 */
function cosineSimilarity(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, a, idx) => sum + a * vectorB[idx], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b ** 2, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Searches for the most similar embeddings in the database.
 * @param {Client} client - A connected PostgreSQL client instance.
 * @param {number[]} queryVector - The query vector for similarity search.
 * @param {number} limit - The maximum number of results to return.
 * @returns {Promise<Object[]>} An array of the most similar embeddings and their metadata.
 */
async function searchEmbeddings(client, queryVector, limit = 10) {
  const query = `SELECT id, vector, metadata FROM embeddings;`;
  const result = await client.query(query);

  const scoredResults = result.rows.map(row => {
    const vector = JSON.parse(row.vector);
    const similarity = cosineSimilarity(queryVector, vector);
    return { id: row.id, similarity, metadata: row.metadata };
  });

  return scoredResults
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

/**
 * Disconnects from the PostgreSQL database.
 * @param {Client} client - A connected PostgreSQL client instance.
 * @returns {Promise<void>} Resolves when the client is disconnected.
 */
async function disconnectFromDatabase(client) {
  await client.end();
}

module.exports = {
  connectToDatabase,
  initializeTable,
  insertEmbedding,
  searchEmbeddings,
  disconnectFromDatabase
};