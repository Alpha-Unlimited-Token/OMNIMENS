// semanticMemoryStore.js

/**
 * @module semanticMemoryStore
 * @description Simulates an in-memory vector store using PostgreSQL for fast semantic search and recall.
 */

const { Client } = require('pg');
const crypto = require('crypto');

/**
 * Initialize a PostgreSQL client and set up the required table for vector storage.
 * @param {string} connectionString - PostgreSQL connection string.
 * @returns {Promise<void>} Resolves when the table is created.
 */
async function initializeDatabase(connectionString) {
  const client = new Client({ connectionString });
  await client.connect();

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS semantic_vectors (
      id SERIAL PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      embedding JSONB NOT NULL,
      metadata JSONB
    );
    CREATE INDEX IF NOT EXISTS embedding_gin ON semantic_vectors USING gin (embedding jsonb_path_ops);
  `;

  await client.query(createTableQuery);
  await client.end();
}

/**
 * Insert a vector embedding and its metadata into the database.
 * @param {string} connectionString - PostgreSQL connection string.
 * @param {string} key - Unique key for the vector.
 * @param {number[]} embedding - Vector embedding as an array of numbers.
 * @param {Object} metadata - Optional metadata associated with the vector.
 * @returns {Promise<void>} Resolves when the vector is inserted.
 */
async function insertVector(connectionString, key, embedding, metadata = {}) {
  const client = new Client({ connectionString });
  await client.connect();

  const query = `
    INSERT INTO semantic_vectors (key, embedding, metadata)
    VALUES ($1, $2, $3)
    ON CONFLICT (key) DO UPDATE SET embedding = $2, metadata = $3;
  `;

  await client.query(query, [key, JSON.stringify(embedding), JSON.stringify(metadata)]);
  await client.end();
}

/**
 * Perform a semantic search to find the most similar vectors based on cosine similarity.
 * @param {string} connectionString - PostgreSQL connection string.
 * @param {number[]} queryVector - Query vector for similarity search.
 * @param {number} topK - Number of top results to return.
 * @returns {Promise<Object[]>} Resolves with an array of results sorted by similarity.
 */
async function searchVectors(connectionString, queryVector, topK = 5) {
  const client = new Client({ connectionString });
  await client.connect();

  const query = `
    SELECT key, metadata, embedding,
      (SELECT SUM((embedding->>index)::FLOAT * $2[index])
       FROM generate_series(0, jsonb_array_length(embedding) - 1) AS index) AS dot_product,
      (SELECT SQRT(SUM(POWER((embedding->>index)::FLOAT, 2)))
       FROM generate_series(0, jsonb_array_length(embedding) - 1) AS index) AS norm_a,
      (SELECT SQRT(SUM(POWER($2[index], 2)))
       FROM generate_series(0, jsonb_array_length(embedding) - 1) AS index) AS norm_b
    FROM semantic_vectors
    ORDER BY dot_product / (norm_a * norm_b) DESC
    LIMIT $3;
  `;

  const result = await client.query(query, [JSON.stringify(queryVector), topK]);
  await client.end();

  return result.rows.map(row => ({
    key: row.key,
    metadata: row.metadata,
    similarity: row.dot_product / (row.norm_a * row.norm_b)
  }));
}

/**
 * Generate a unique key for a vector entry.
 * @param {string} prefix - Optional prefix for the key.
 * @returns {string} A unique key.
 */
function generateKey(prefix = 'vector') {
  return `${prefix}-${crypto.randomUUID()}`;
}

module.exports = {
  initializeDatabase,
  insertVector,
  searchVectors,
  generateKey
};