/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: realTimeStateSync
 * Written: 2026-03-24T04:14:47.752Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
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
