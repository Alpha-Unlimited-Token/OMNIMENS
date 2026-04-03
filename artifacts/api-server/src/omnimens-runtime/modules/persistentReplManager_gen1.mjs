/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_8
 * Name: persistentReplManager
 * Purpose: Enable persistent REPL state across subprocess executions for iterative computation.
 * Description: Enables persistent REPL state across executions by serializing state and parsing/generating code via AST manipulation.
 * Migrated: 2026-04-03T09:08:54.989Z
 */

// persistentReplManager.mjs
import { parse, generate } from 'esprima';

/**
 * Serialize REPL state into a JSON format for persistence.
 * @param {object} state - The current REPL state object.
 * @returns {string} Serialized JSON string.
 */
export function serializeState(state) {
  try {
    return JSON.stringify(state);
  } catch (error) {
    throw new Error(`Failed to serialize state: ${error.message}`);
  }
}

/**
 * Deserialize JSON string back into REPL state object.
 * @param {string} serializedState - JSON string representing the REPL state.
 * @returns {object} Deserialized REPL state object.
 */
export function deserializeState(serializedState) {
  try {
    return JSON.parse(serializedState);
  } catch (error) {
    throw new Error(`Failed to deserialize state: ${error.message}`);
  }
}

/**
 * Parse JavaScript code into an Abstract Syntax Tree (AST).
 * @param {string} code - JavaScript code as a string.
 * @returns {object} AST representation of the code.
 */
export function parseCodeToAST(code) {
  try {
    return parse(code, { tolerant: true, loc: true });
  } catch (error) {
    throw new Error(`Failed to parse code to AST: ${error.message}`);
  }
}

/**
 * Generate JavaScript code from an Abstract Syntax Tree (AST).
 * @param {object} ast - Abstract Syntax Tree object.
 * @returns {string} JavaScript code as a string.
 */
export function generateCodeFromAST(ast) {
  try {
    return generate(ast);
  } catch (error) {
    throw new Error(`Failed to generate code from AST: ${error.message}`);
  }
}

/**
 * Create a snapshot of the REPL state, combining serialized state and AST.
 * @param {object} state - The current REPL state object.
 * @param {string} code - JavaScript code executed in the REPL.
 * @returns {object} Snapshot containing serialized state and AST.
 */
export function createSnapshot(state, code) {
  try {
    const serializedState = serializeState(state);
    const ast = parseCodeToAST(code);
    return { serializedState, ast };
  } catch (error) {
    throw new Error(`Failed to create snapshot: ${error.message}`);
  }
}

/**
 * Restore REPL state and code from a snapshot.
 * @param {object} snapshot - Snapshot containing serialized state and AST.
 * @returns {object} Restored REPL state and code.
 */
export function restoreFromSnapshot(snapshot) {
  try {
    const state = deserializeState(snapshot.serializedState);
    const code = generateCodeFromAST(snapshot.ast);
    return { state, code };
  } catch (error) {
    throw new Error(`Failed to restore from snapshot: ${error.message}`);
  }
}