/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextualMemoryManager
 * Written: 2026-04-01T22:16:27.040Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here
import crypto from 'crypto';

// Utility function to generate a unique hash for context summaries
export function generateHash(input) {
  const hash = crypto.createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

// Function to summarize context into a fixed-length embedding
export function summarizeContext(context, maxLength = 256) {
  if (typeof context !== 'string') {
    throw new TypeError('Context must be a string');
  }

  // Simple summarization by truncation and hashing (can be replaced with more advanced techniques)
  const truncated = context.slice(0, maxLength);
  const embedding = generateHash(truncated);

  return { summary: truncated, embedding };
}

// Function to store summarized context in a PostgreSQL-compatible format
export function storeSummary(pgClient, summary, embedding) {
  if (!pgClient || typeof pgClient.query !== 'function') {
    throw new Error('Invalid PostgreSQL client');
  }

  const query = `
    INSERT INTO context_summaries (summary, embedding, created_at)
    VALUES ($1, $2, NOW())
    ON CONFLICT (embedding) DO NOTHING;
  `;

  return pgClient.query(query, [summary, embedding]);
}

// Function to retrieve the most relevant summaries based on a query
export async function retrieveRelevantSummaries(pgClient, queryText, limit = 5) {
  if (!pgClient || typeof pgClient.query !== 'function') {
    throw new Error('Invalid PostgreSQL client');
  }

  const query = `
    SELECT summary, embedding
    FROM context_summaries
    WHERE summary ILIKE $1
    ORDER BY created_at DESC
    LIMIT $2;
  `;

  const results = await pgClient.query(query, [`%${queryText}%`, limit]);
  return results.rows;
}

// Function to manage hierarchical context storage and retrieval
export async function contextualMemoryManager(pgClient, context, queryText, maxLength = 256, limit = 5) {
  if (!pgClient || typeof pgClient.query !== 'function') {
    throw new Error('Invalid PostgreSQL client');
  }

  // Summarize and store the new context
  const { summary, embedding } = summarizeContext(context, maxLength);
  await storeSummary(pgClient, summary, embedding);

  // Retrieve relevant summaries for the query
  const relevantSummaries = await retrieveRelevantSummaries(pgClient, queryText, limit);

  return relevantSummaries;
}

// Example utility function to validate PostgreSQL connection
export async function validatePostgresConnection(pgClient) {
  if (!pgClient || typeof pgClient.query !== 'function') {
    throw new Error('Invalid PostgreSQL client');
  }

  try {
    await pgClient.query('SELECT 1');
    return true;
  } catch (error) {
    return false;
  }
}

// Example utility function to initialize the database schema
export async function initializeDatabaseSchema(pgClient) {
  if (!pgClient || typeof pgClient.query !== 'function') {
    throw new Error('Invalid PostgreSQL client');
  }

  const schema = `
    CREATE TABLE IF NOT EXISTS context_summaries (
      id SERIAL PRIMARY KEY,
      summary TEXT NOT NULL,
      embedding TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await pgClient.query(schema);
} 
