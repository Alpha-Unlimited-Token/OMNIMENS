/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_16
 * Name: modulePersistenceHandler
 * Purpose: Enables dynamic module persistence using in-memory serialization and PostgreSQL storage.
 * Description: Enables dynamic persistence of module states using in-memory serialization and PostgreSQL storage for rapid reloading and cross-agent utility.
 * Migrated: 2026-04-01T22:23:20.246Z
 */

// Complete ES module code here

import { Client } from 'pg';
import { randomUUID } from 'crypto';

export const createPersistenceHandler = (dbConfig) => {
    const client = new Client(dbConfig);

    async function initialize() {
        await client.connect();
        await client.query(`CREATE TABLE IF NOT EXISTS module_states (
            id UUID PRIMARY KEY,
            module_name TEXT NOT NULL,
            state JSONB NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`);
    }

    async function saveState(moduleName, state) {
        const id = randomUUID();
        const query = `INSERT INTO module_states (id, module_name, state, updated_at) 
                       VALUES ($1, $2, $3, CURRENT_TIMESTAMP) 
                       ON CONFLICT (module_name) DO UPDATE SET 
                       state = EXCLUDED.state, 
                       updated_at = EXCLUDED.updated_at;`;
        await client.query(query, [id, moduleName, JSON.stringify(state)]);
    }

    async function loadState(moduleName) {
        const query = `SELECT state FROM module_states WHERE module_name = $1;`;
        const result = await client.query(query, [moduleName]);
        return result.rows.length ? result.rows[0].state : null;
    }

    async function deleteState(moduleName) {
        const query = `DELETE FROM module_states WHERE module_name = $1;`;
        await client.query(query, [moduleName]);
    }

    async function listModules() {
        const query = `SELECT module_name FROM module_states;`;
        const result = await client.query(query);
        return result.rows.map(row => row.module_name);
    }

    async function closeConnection() {
        await client.end();
    }

    return {
        initialize,
        saveState,
        loadState,
        deleteState,
        listModules,
        closeConnection
    };
};