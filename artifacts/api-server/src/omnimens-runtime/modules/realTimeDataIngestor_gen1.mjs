/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: realTimeDataIngestor
 * Written: 2026-03-24T23:24:28.473Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// realTimeDataIngestor.mjs

import { WebSocketServer } from 'ws';

/**
 * Initializes a WebSocket server for real-time data ingestion.
 * @param {number} port - The port number for the WebSocket server.
 * @returns {WebSocketServer} - The WebSocket server instance.
 */
export function initializeWebSocketServer(port) {
  const wss = new WebSocketServer({ port });

  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        const { topic, data, metadata } = parsedMessage;

        if (isValidMetadata(metadata)) {
          const processedData = processData(topic, data);
          ws.send(JSON.stringify({ topic, processedData }));
        } else {
          ws.send(JSON.stringify({ error: 'Invalid metadata' }));
        }
      } catch (error) {
        ws.send(JSON.stringify({ error: 'Invalid message format' }));
      }
    });
  });

  return wss;
}

/**
 * Validates metadata for incoming data.
 * @param {object} metadata - Metadata object to validate.
 * @returns {boolean} - True if metadata is valid, false otherwise.
 */
export function isValidMetadata(metadata) {
  return metadata && typeof metadata === 'object' && 'source' in metadata && 'timestamp' in metadata;
}

/**
 * Processes incoming data based on the topic.
 * @param {string} topic - The topic associated with the data.
 * @param {any} data - The data to process.
 * @returns {any} - Processed data.
 */
export function processData(topic, data) {
  switch (topic) {
    case 'math':
      return processMathData(data);
    case 'text':
      return processTextData(data);
    case 'neuro':
      return processNeuroData(data);
    default:
      return { error: 'Unknown topic' };
  }
}

/**
 * Example processing function for math-related data.
 * @param {number[]} data - Array of numbers.
 * @returns {object} - Processed math data.
 */
export function processMathData(data) {
  if (!Array.isArray(data) || data.some((x) => typeof x !== 'number')) {
    return { error: 'Invalid math data' };
  }
  const sum = data.reduce((a, b) => a + b, 0);
  const average = sum / data.length;
  return { sum, average };
}

/**
 * Example processing function for text-related data.
 * @param {string} data - Text input.
 * @returns {object} - Processed text data.
 */
export function processTextData(data) {
  if (typeof data !== 'string') {
    return { error: 'Invalid text data' };
  }
  const wordCount = data.split(/\s+/).length;
  const charCount = data.length;
  return { wordCount, charCount };
}

/**
 * Example processing function for neuro-related data.
 * @param {object} data - Neuro data object.
 * @returns {object} - Processed neuro data.
 */
export function processNeuroData(data) {
  if (typeof data !== 'object' || !data.neurons || !data.connections) {
    return { error: 'Invalid neuro data' };
  }
  const neuronCount = data.neurons.length;
  const connectionCount = data.connections.length;
  return { neuronCount, connectionCount };
}

/**
 * Subscribes dynamically to a topic.
 * @param {WebSocket} ws - WebSocket client instance.
 * @param {string} topic - Topic to subscribe to.
 */
export function subscribeToTopic(ws, topic) {
  ws.send(JSON.stringify({ action: 'subscribe', topic }));
}

/**
 * Unsubscribes dynamically from a topic.
 * @param {WebSocket} ws - WebSocket client instance.
 * @param {string} topic - Topic to unsubscribe from.
 */
export function unsubscribeFromTopic(ws, topic) {
  ws.send(JSON.stringify({ action: 'unsubscribe', topic }));
}

/**
 * Starts the WebSocket server on the given port.
 * @param {number} port - Port number.
 */
export function startServer(port) {
  const server = initializeWebSocketServer(port);
  console.log(`WebSocket server started on port ${port}`);
}
