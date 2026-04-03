/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: distributedAgentFramework
 * Written: 2026-04-03T14:06:55.386Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// distributedAgentFramework.mjs

import { EventEmitter } from 'events';

// Utility to generate unique IDs for agents
export function generateAgentId() {
  return crypto.randomUUID();
}

// Core message broker using EventEmitter for inter-agent communication
const messageBroker = new EventEmitter();

// Publish a message to a specific topic
export function publishMessage(topic, message) {
  if (typeof topic !== 'string' || topic.trim() === '') {
    throw new Error('Topic must be a non-empty string.');
  }
  messageBroker.emit(topic, message);
}

// Subscribe an agent to a specific topic
export function subscribeToTopic(topic, callback) {
  if (typeof topic !== 'string' || topic.trim() === '') {
    throw new Error('Topic must be a non-empty string.');
  }
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function.');
  }
  messageBroker.on(topic, callback);
}

// Unsubscribe an agent from a specific topic
export function unsubscribeFromTopic(topic, callback) {
  if (typeof topic !== 'string' || topic.trim() === '') {
    throw new Error('Topic must be a non-empty string.');
  }
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function.');
  }
  messageBroker.off(topic, callback);
}

// Broadcast a message to all agents
export function broadcastMessage(message) {
  messageBroker.emit('broadcast', message);
}

// Subscribe to broadcast messages
export function subscribeToBroadcast(callback) {
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function.');
  }
  messageBroker.on('broadcast', callback);
}

// Example: Multi-agent coordination utility
export function coordinateAgents(agents, taskFunction) {
  if (!Array.isArray(agents) || agents.length === 0) {
    throw new Error('Agents must be a non-empty array.');
  }
  if (typeof taskFunction !== 'function') {
    throw new Error('Task function must be a function.');
  }

  const results = agents.map(agent => {
    try {
      return taskFunction(agent);
    } catch (error) {
      return { error: error.message };
    }
  });

  return results;
}

// Example: Distributed task assignment utility
export function assignTasks(tasks, agents) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new Error('Tasks must be a non-empty array.');
  }
  if (!Array.isArray(agents) || agents.length === 0) {
    throw new Error('Agents must be a non-empty array.');
  }

  const assignments = {};
  tasks.forEach((task, index) => {
    const agent = agents[index % agents.length];
    if (!assignments[agent]) {
      assignments[agent] = [];
    }
    assignments[agent].push(task);
  });

  return assignments;
}

// Example: Fault-tolerant message retry utility
export function retryMessage(topic, message, maxRetries = 3, delayMs = 1000) {
  let attempts = 0;

  const tryPublish = () => {
    attempts++;
    try {
      publishMessage(topic, message);
    } catch (error) {
      if (attempts < maxRetries) {
        setTimeout(tryPublish, delayMs);
      } else {
        throw new Error(`Failed to publish message after ${maxRetries} attempts: ${error.message}`);
      }
    }
  };

  tryPublish();
}

// Example: Logging utility for debugging agent communication
export function logAgentActivity(agentId, activity) {
  if (typeof agentId !== 'string' || agentId.trim() === '') {
    throw new Error('Agent ID must be a non-empty string.');
  }
  if (typeof activity !== 'string' || activity.trim() === '') {
    throw new Error('Activity must be a non-empty string.');
  }
  console.log(`[Agent ${agentId}] ${activity}`);
}

// Example: Validate message payload
export function validateMessagePayload(payload) {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('Payload must be a non-null object.');
  }
  return true;
}