/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: memoryAugmentationStore
 * Purpose: Enable fast retrieval and manipulation of embeddings for context-aware reasoning.
 * Description: A memory augmentation module for storing embeddings in SQLite and performing fast approximate nearest neighbor search for context-aware reasoning.
 * Migrated: 2026-03-25T22:49:34.254Z
 */

/**
 * @module memoryAugmentationStore
 * @description A utility module for storing and retrieving embeddings efficiently
 *              using SQLite in memory mode, with approximate nearest neighbor search.
 */

import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

/**
 * Initialize an in-memory SQLite database for storing embeddings.
 * @returns {Promise<Object>} A database instance with the embeddings table set up.
 */
export async function initializeDatabase() {
  const db = await open({
    filename: ':memory:',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE embeddings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vector TEXT NOT NULL,
      metadata TEXT
    );
  `);

  return db;
}

/**
 * Insert an embedding vector into the database.
 * @param {Object} db - The SQLite database instance.
 * @param {number[]} vector - The embedding vector to store.
 * @param {Object} [metadata={}] - Optional metadata associated with the embedding.
 * @returns {Promise<number>} The ID of the inserted embedding.
 */
export async function insertEmbedding(db, vector, metadata = {}) {
  const vectorString = JSON.stringify(vector);
  const metadataString = JSON.stringify(metadata);

  const result = await db.run(
    'INSERT INTO embeddings (vector, metadata) VALUES (?, ?)',
    vectorString,
    metadataString
  );

  return result.lastID;
}

/**
 * Retrieve the nearest embedding vectors to a given query vector.
 * Uses cosine similarity for approximate nearest neighbor search.
 * @param {Object} db - The SQLite database instance.
 * @param {number[]} queryVector - The query embedding vector.
 * @param {number} k - The number of nearest neighbors to retrieve.
 * @returns {Promise<Object[]>} An array of nearest embeddings with metadata and similarity scores.
 */
export async function findNearestNeighbors(db, queryVector, k) {
  const embeddings = await db.all('SELECT id, vector, metadata FROM embeddings');

  const queryMagnitude = Math.sqrt(queryVector.reduce((sum, val) => sum + val ** 2, 0));

  const results = embeddings.map(({ id, vector, metadata }) => {
    const storedVector = JSON.parse(vector);
    const dotProduct = storedVector.reduce((sum, val, i) => sum + val * queryVector[i], 0);
    const storedMagnitude = Math.sqrt(storedVector.reduce((sum, val) => sum + val ** 2, 0));

    const similarity = dotProduct / (queryMagnitude * storedMagnitude);

    return { id, metadata: JSON.parse(metadata), similarity };
  });

  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, k);
}

/**
 * Delete all embeddings from the database.
 * @param {Object} db - The SQLite database instance.
 * @returns {Promise<void>} Resolves when the operation is complete.
 */
export async function clearEmbeddings(db) {
  await db.exec('DELETE FROM embeddings');
}

/**
 * Close the SQLite database connection.
 * @param {Object} db - The SQLite database instance.
 * @returns {Promise<void>} Resolves when the database is closed.
 */
export async function closeDatabase(db) {
  await db.close();
}

// Example usage (commented out):
// (async () => {
//   const db = await initializeDatabase();
//   const id = await insertEmbedding(db, [0.1, 0.2, 0.3], { label: 'example' });
//   const neighbors = await findNearestNeighbors(db, [0.1, 0.2, 0.3], 1);
//   console.log(neighbors);
//   await clearEmbeddings(db);
//   await closeDatabase(db);
// })();