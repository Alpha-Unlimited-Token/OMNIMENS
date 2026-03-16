/**
 * @module persistentMemoryManager
 * @description This module manages persistent memory for storing and retrieving conversation contexts using PostgreSQL.
 * It enables OMNIMENS to maintain context beyond the token window with relevance-based retrieval.
 */

const { Client } = require('pg');

/**
 * PersistentMemoryManager class to handle storage and retrieval of conversation contexts.
 */
class PersistentMemoryManager {
  /**
   * Initializes the PersistentMemoryManager with PostgreSQL connection details.
   * @param {Object} config - PostgreSQL configuration object.
   * @param {string} config.host - Database host.
   * @param {number} config.port - Database port.
   * @param {string} config.user - Database user.
   * @param {string} config.password - Database password.
   * @param {string} config.database - Database name.
   */
  constructor(config) {
    this.client = new Client(config);
  }

  /**
   * Connects to the PostgreSQL database.
   * @returns {Promise<void>} Resolves when connected.
   */
  async connect() {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to PostgreSQL:', error);
      throw error;
    }
  }

  /**
   * Disconnects from the PostgreSQL database.
   * @returns {Promise<void>} Resolves when disconnected.
   */
  async disconnect() {
    try {
      await this.client.end();
    } catch (error) {
      console.error('Failed to disconnect from PostgreSQL:', error);
      throw error;
    }
  }

  /**
   * Stores a conversation context in the database.
   * @param {string} sessionId - Unique identifier for the session.
   * @param {string} context - The conversation context to store.
   * @param {number} relevance - Relevance score of the context.
   * @returns {Promise<void>} Resolves when the context is stored.
   */
  async storeContext(sessionId, context, relevance) {
    try {
      const query = `
        INSERT INTO conversation_contexts (session_id, context, relevance, created_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (session_id, context) DO UPDATE
        SET relevance = EXCLUDED.relevance, created_at = NOW();
      `;
      await this.client.query(query, [sessionId, context, relevance]);
    } catch (error) {
      console.error('Failed to store context:', error);
      throw error;
    }
  }

  /**
   * Retrieves the most relevant contexts for a session.
   * @param {string} sessionId - Unique identifier for the session.
   * @param {number} limit - Maximum number of contexts to retrieve.
   * @returns {Promise<Array<{context: string, relevance: number}>>} Resolves with an array of contexts.
   */
  async retrieveContexts(sessionId, limit = 5) {
    try {
      const query = `
        SELECT context, relevance
        FROM conversation_contexts
        WHERE session_id = $1
        ORDER BY relevance DESC, created_at DESC
        LIMIT $2;
      `;
      const result = await this.client.query(query, [sessionId, limit]);
      return result.rows;
    } catch (error) {
      console.error('Failed to retrieve contexts:', error);
      throw error;
    }
  }

  /**
   * Deletes old or irrelevant contexts from the database.
   * @param {number} threshold - Relevance threshold below which contexts are deleted.
   * @returns {Promise<void>} Resolves when cleanup is complete.
   */
  async cleanupContexts(threshold) {
    try {
      const query = `
        DELETE FROM conversation_contexts
        WHERE relevance < $1;
      `;
      await this.client.query(query, [threshold]);
    } catch (error) {
      console.error('Failed to cleanup contexts:', error);
      throw error;
    }
  }
}

/**
 * Initializes the database schema for storing conversation contexts.
 * @param {Client} client - PostgreSQL client instance.
 * @returns {Promise<void>} Resolves when the schema is initialized.
 */
async function initializeSchema(client) {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS conversation_contexts (
        session_id TEXT NOT NULL,
        context TEXT NOT NULL,
        relevance INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL,
        PRIMARY KEY (session_id, context)
      );
    `;
    await client.query(query);
  } catch (error) {
    console.error('Failed to initialize schema:', error);
    throw error;
  }
}

module.exports = {
  PersistentMemoryManager,
  initializeSchema
};