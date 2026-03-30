/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: semanticSearchIndex
 * Purpose: Creates a simulated vector store using PostgreSQL for fast semantic searches.
 * Description: Implements a PostgreSQL-based semantic search index with cosine similarity for fast retrieval of embeddings.
 * Migrated: 2026-03-25T22:49:34.195Z
 */

/**
 * @module semanticSearchIndex
 * @description Implements a simulated vector store using PostgreSQL for fast semantic searches.
 * Embeddings are stored as JSONB objects, and cosine similarity is used for retrieval.
 */

import crypto from 'crypto';

/**
 * Generates a unique identifier for an embedding.
 * @param {Float32Array} embedding - The embedding to generate an ID for.
 * @returns {string} A unique hash ID for the embedding.
 */
export function generateEmbeddingId(embedding) {
  const hash = crypto.createHash('sha256');
  hash.update(embedding.join(','));
  return hash.digest('hex');
}

/**
 * Converts a vector (embedding) into a normalized unit vector.
 * @param {Float32Array} vector - The vector to normalize.
 * @returns {Float32Array} The normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return new Float32Array(vector.map(val => val / magnitude));
}

/**
 * Computes cosine similarity between two normalized vectors.
 * @param {Float32Array} vectorA - The first normalized vector.
 * @param {Float32Array} vectorB - The second normalized vector.
 * @returns {number} The cosine similarity between the two vectors.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same dimension.');
  }
  return vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
}

/**
 * Prepares a SQL query to insert an embedding into a PostgreSQL database.
 * @param {string} id - The unique ID of the embedding.
 * @param {Float32Array} embedding - The normalized embedding vector.
 * @returns {string} The SQL query to insert the embedding.
 */
export function prepareInsertQuery(id, embedding) {
  const embeddingJson = JSON.stringify(Array.from(embedding));
  return `INSERT INTO embeddings (id, vector) VALUES ('${id}', '${embeddingJson}') ON CONFLICT (id) DO NOTHING;`;
}

/**
 * Prepares a SQL query to retrieve the top N closest embeddings by cosine similarity.
 * @param {Float32Array} queryVector - The normalized query vector.
 * @param {number} topN - The number of closest embeddings to retrieve.
 * @returns {string} The SQL query to retrieve the closest embeddings.
 */
export function prepareSearchQuery(queryVector, topN) {
  const queryJson = JSON.stringify(Array.from(queryVector));
  return `
    SELECT id, vector, 
           (vector <-> '${queryJson}'::jsonb) AS similarity
    FROM embeddings
    ORDER BY similarity ASC
    LIMIT ${topN};
  `;
}

/**
 * Validates that a vector is a Float32Array and non-empty.
 * @param {any} vector - The vector to validate.
 * @throws {Error} If the vector is invalid.
 */
export function validateVector(vector) {
  if (!(vector instanceof Float32Array)) {
    throw new Error('Vector must be a Float32Array.');
  }
  if (vector.length === 0) {
    throw new Error('Vector must not be empty.');
  }
}

/**
 * Example usage of the module.
 * Demonstrates normalization, ID generation, and query preparation.
 */
export function exampleUsage() {
  const embedding = new Float32Array([0.1, 0.2, 0.3]);
  validateVector(embedding);

  const normalized = normalizeVector(embedding);
  const id = generateEmbeddingId(normalized);

  console.log('Generated ID:', id);
  console.log('Normalized Vector:', normalized);

  const insertQuery = prepareInsertQuery(id, normalized);
  console.log('Insert Query:', insertQuery);

  const searchQuery = prepareSearchQuery(normalized, 5);
  console.log('Search Query:', searchQuery);
}

// Uncomment to run example usage
// exampleUsage();