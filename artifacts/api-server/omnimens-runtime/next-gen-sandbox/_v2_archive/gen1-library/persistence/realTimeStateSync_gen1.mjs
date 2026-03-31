/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: realTimeStateSync
 * Purpose: Synchronizes in-memory state updates in real-time to reduce latency in file persistence.
 * Description: Synchronizes in-memory state updates in real-time using WebSocket-based event propagation with atomic validation and update utilities.
 * Migrated: 2026-03-25T22:49:34.146Z
 */

// realTimeStateSync.mjs

import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';

// Utility to create a WebSocket server for real-time state synchronization
export function createWebSocketServer(port) {
  const wss = new WebSocketServer({ port });
  const clients = new Map();

  wss.on('connection', (ws) => {
    const clientId = randomUUID();
    clients.set(clientId, ws);

    ws.on('message', (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        broadcastStateUpdate(clientId, parsedMessage, clients);
      } catch (error) {
        console.error('Invalid message format:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(clientId);
    });
  });

  return wss;
}

// Broadcast state updates to all connected clients except the sender
export function broadcastStateUpdate(senderId, stateUpdate, clients) {
  for (const [clientId, ws] of clients.entries()) {
    if (clientId !== senderId && ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(stateUpdate));
    }
  }
}

// Utility to validate state updates for atomicity and consistency
export function validateStateUpdate(stateUpdate, schema) {
  if (typeof stateUpdate !== 'object' || stateUpdate === null) {
    return false;
  }

  for (const key of Object.keys(schema)) {
    if (!schema[key](stateUpdate[key])) {
      return false;
    }
  }

  return true;
}

// Example schema validator functions
export const schemaValidators = {
  isString: (value) => typeof value === 'string',
  isNumber: (value) => typeof value === 'number',
  isBoolean: (value) => typeof value === 'boolean',
  isArray: (value) => Array.isArray(value)
};

// Utility to merge state updates atomically
export function mergeState(currentState, stateUpdate) {
  return { ...currentState, ...stateUpdate };
}

// Utility to generate unique identifiers for state keys
export function generateUniqueKey(prefix = 'key') {
  return `${prefix}-${randomUUID()}`;
}

// Example usage:
// const wss = createWebSocketServer(8080);
// const currentState = {};
// const update = { key: 'value' };
// const validated = validateStateUpdate(update, { key: schemaValidators.isString });
// if (validated) {
//   const newState = mergeState(currentState, update);
//   console.log(newState);
// }
