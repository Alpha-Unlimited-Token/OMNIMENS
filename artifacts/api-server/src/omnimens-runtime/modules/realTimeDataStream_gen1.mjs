/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: realTimeDataStream
 * Written: 2026-03-24T13:26:25.298Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// realTimeDataStream.mjs

import { WebSocketServer } from 'ws';

// Utility function to create a WebSocket server
export function createWebSocketServer(port, onClientMessage) {
  const wss = new WebSocketServer({ port });

  wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        if (typeof onClientMessage === 'function') {
          const response = onClientMessage(parsedMessage);
          if (response) {
            ws.send(JSON.stringify(response));
          }
        }
      } catch (error) {
        console.error('Error processing client message:', error);
        ws.send(JSON.stringify({ error: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  console.log(`WebSocket server running on ws://localhost:${port}`);
  return wss;
}

// Utility function to create a dynamic state manager
export function createStateManager(initialState = {}) {
  let state = { ...initialState };

  return {
    getState: () => ({ ...state }),
    updateState: (updates) => {
      if (typeof updates === 'object' && updates !== null) {
        state = { ...state, ...updates };
      } else {
        throw new Error('State updates must be an object');
      }
    },
    resetState: () => {
      state = { ...initialState };
    }
  };
}

// Example usage function to demonstrate real-time data streaming
export function startRealTimeDataStream(port = 8080) {
  const stateManager = createStateManager({ clients: 0 });

  const server = createWebSocketServer(port, (message) => {
    if (message.type === 'increment') {
      stateManager.updateState({ clients: stateManager.getState().clients + 1 });
      return { type: 'stateUpdate', state: stateManager.getState() };
    } else if (message.type === 'decrement') {
      stateManager.updateState({ clients: Math.max(stateManager.getState().clients - 1, 0) });
      return { type: 'stateUpdate', state: stateManager.getState() };
    } else if (message.type === 'getState') {
      return { type: 'stateUpdate', state: stateManager.getState() };
    } else {
      return { error: 'Unknown message type' };
    }
  });

  return { server, stateManager };
}

// Exported utility functions for cross-agent use
export const realTimeUtilityFunctions = {
  createWebSocketServer,
  createStateManager,
  startRealTimeDataStream
};