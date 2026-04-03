/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_2
 * Name: statefulTaskOrchestrator
 * Purpose: Maintain iterative computational state across subprocesses by serializing intermediate states into PostgreSQL.
 * Description: Stateful task orchestrator with PostgreSQL persistence for iterative computational state management across subprocesses.
 * Migrated: 2026-04-03T14:25:03.331Z
 */

// Complete ES module code here

import { Client } from 'pg';
import { randomUUID } from 'crypto';

// Utility to connect to PostgreSQL
export async function createDbConnection(config) {
  const client = new Client(config);
  await client.connect();
  return client;
}

// Utility to initialize the database schema
export async function initializeSchema(client) {
  const query = `
    CREATE TABLE IF NOT EXISTS task_states (
      id UUID PRIMARY KEY,
      task_name TEXT NOT NULL,
      state JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await client.query(query);
}

// Save task state to the database
export async function saveTaskState(client, taskName, state) {
  const id = randomUUID();
  const query = `
    INSERT INTO task_states (id, task_name, state)
    VALUES ($1, $2, $3)
    ON CONFLICT (id) DO UPDATE SET
      state = EXCLUDED.state,
      updated_at = CURRENT_TIMESTAMP;
  `;
  await client.query(query, [id, taskName, JSON.stringify(state)]);
  return id;
}

// Load task state from the database
export async function loadTaskState(client, taskName) {
  const query = `
    SELECT state FROM task_states
    WHERE task_name = $1
    ORDER BY updated_at DESC
    LIMIT 1;
  `;
  const result = await client.query(query, [taskName]);
  return result.rows.length > 0 ? result.rows[0].state : null;
}

// Delete task state from the database
export async function deleteTaskState(client, taskName) {
  const query = `
    DELETE FROM task_states
    WHERE task_name = $1;
  `;
  await client.query(query, [taskName]);
}

// Utility to orchestrate a task with state persistence
export async function orchestrateTask(client, taskName, taskFunction, initialState = {}) {
  let state = await loadTaskState(client, taskName) || initialState;
  try {
    state = await taskFunction(state);
    await saveTaskState(client, taskName, state);
  } catch (error) {
    console.error(`Error in task '${taskName}':`, error);
    throw error;
  }
  return state;
}

// Example task function
export async function exampleTaskFunction(state) {
  state.counter = (state.counter || 0) + 1;
  return state;
}

// Example usage
export async function exampleUsage() {
  const config = {
    user: 'postgres',
    host: 'localhost',
    database: 'stateful_tasks',
    password: 'password',
    port: 5432,
  };

  const client = await createDbConnection(config);
  await initializeSchema(client);

  const taskName = 'example_task';
  const finalState = await orchestrateTask(client, taskName, exampleTaskFunction);

  console.log('Final state:', finalState);
  await client.end();
}
