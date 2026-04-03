/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: distributedTaskManager
 * Written: 2026-04-03T00:50:04.187Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// distributedTaskManager.mjs

import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';

// Utility: Generate a random UUID for node identification
export function generateNodeId() {
  return randomUUID();
}

// Utility: Simple leader-election mechanism using Raft-like principles
export function electLeader(nodes) {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    throw new Error('Nodes array must be non-empty.');
  }
  nodes.sort((a, b) => a.id.localeCompare(b.id));
  return nodes[0];
}

// Utility: Task assignment based on round-robin scheduling
export function assignTasks(nodes, tasks) {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    throw new Error('Nodes array must be non-empty.');
  }
  if (!Array.isArray(tasks)) {
    throw new Error('Tasks must be an array.');
  }

  const assignments = {};
  let nodeIndex = 0;

  for (const task of tasks) {
    const node = nodes[nodeIndex];
    if (!assignments[node.id]) {
      assignments[node.id] = [];
    }
    assignments[node.id].push(task);
    nodeIndex = (nodeIndex + 1) % nodes.length;
  }

  return assignments;
}

// Core: WebSocket-based distributed task manager
export function startDistributedTaskManager(port, nodeId, onTaskReceived) {
  const wss = new WebSocketServer({ port });
  const peers = new Map();

  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      const parsedMessage = JSON.parse(message);

      if (parsedMessage.type === 'task') {
        onTaskReceived(parsedMessage.task);
      } else if (parsedMessage.type === 'register') {
        peers.set(parsedMessage.nodeId, ws);
      }
    });

    ws.on('close', () => {
      for (const [peerId, peerWs] of peers.entries()) {
        if (peerWs === ws) {
          peers.delete(peerId);
          break;
        }
      }
    });
  });

  return {
    broadcastTask(task) {
      for (const ws of peers.values()) {
        ws.send(JSON.stringify({ type: 'task', task }));
      }
    },

    registerPeer(peerUrl) {
      const ws = new WebSocket(peerUrl);

      ws.on('open', () => {
        ws.send(JSON.stringify({ type: 'register', nodeId }));
        peers.set(peerUrl, ws);
      });

      ws.on('close', () => {
        peers.delete(peerUrl);
      });
    },

    getPeers() {
      return Array.from(peers.keys());
    }
  };
}

// Example usage function for testing
export function exampleUsage() {
  const nodeId = generateNodeId();
  const manager = startDistributedTaskManager(8080, nodeId, (task) => {
    console.log(`Node ${nodeId} received task:`, task);
  });

  console.log(`Node ${nodeId} running on port 8080.`);

  setTimeout(() => {
    manager.broadcastTask({ taskId: 'task1', payload: 'Process data' });
  }, 5000);

  return manager;
}