/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: modulePersistenceHandler
 * Written: 2026-04-01T22:03:29.710Z
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