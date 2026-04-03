/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: topicAwareMemoryManager
 * Written: 2026-04-03T07:01:20.570Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// topicAwareMemoryManager.mjs

import { createHash } from 'crypto';

/**
 * Hashes a string to create a unique identifier for memory entries.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function generateMemoryId(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Groups memory entries into topics using a simple keyword-based approach.
 * @param {Array<{ id, content}>} memoryEntries - Array of memory entries.
 * @param {Array<string>} topics - Array of topic keywords.
 * @returns {Object} - An object where keys are topics and values are arrays of memory entries.
 */
export function organizeByTopics(memoryEntries, topics) {
  const topicMap = {};

  // Initialize topic map
  for (const topic of topics) {
    topicMap[topic] = [];
  }

  // Classify entries into topics
  for (const entry of memoryEntries) {
    let matched = false;
    for (const topic of topics) {
      if (entry.content.toLowerCase().includes(topic.toLowerCase())) {
        topicMap[topic].push(entry);
        matched = true;
        break;
      }
    }

    // If no topic matches, classify as 'uncategorized'
    if (!matched) {
      if (!topicMap['uncategorized']) {
        topicMap['uncategorized'] = [];
      }
      topicMap['uncategorized'].push(entry);
    }
  }

  return topicMap;
}

/**
 * Retrieves the most relevant memory entries for a given topic.
 * @param {Object} topicMap - The organized memory map.
 * @param {string} topic - The topic to retrieve entries for.
 * @param {number} limit - Maximum number of entries to retrieve.
 * @returns {Array<{ id, content}>} - Array of memory entries for the topic.
 */
export function retrieveByTopic(topicMap, topic, limit = 5) {
  if (!topicMap[topic]) {
    return [];
  }

  return topicMap[topic].slice(0, limit);
}

/**
 * Adds a new memory entry and updates the topic map.
 * @param {Object} topicMap - The organized memory map.
 * @param {Array<string>} topics - Array of topic keywords.
 * @param {string} content - The content of the new memory entry.
 * @returns {Object} - Updated topic map.
 */
export function addMemoryEntry(topicMap, topics, content) {
  const id = generateMemoryId(content);
  const newEntry = { id, content };

  let matched = false;
  for (const topic of topics) {
    if (content.toLowerCase().includes(topic.toLowerCase())) {
      topicMap[topic].push(newEntry);
      matched = true;
      break;
    }
  }

  if (!matched) {
    if (!topicMap['uncategorized']) {
      topicMap['uncategorized'] = [];
    }
    topicMap['uncategorized'].push(newEntry);
  }

  return topicMap;
}

/**
 * Removes a memory entry by its ID.
 * @param {Object} topicMap - The organized memory map.
 * @param {string} id - The ID of the memory entry to remove.
 * @returns {Object} - Updated topic map.
 */
export function removeMemoryEntry(topicMap, id) {
  for (const topic in topicMap) {
    topicMap[topic] = topicMap[topic].filter(entry => entry.id !== id);
  }

  return topicMap;
}

/**
 * Prioritizes topics based on their relevance to a query.
 * @param {Object} topicMap - The organized memory map.
 * @param {string} query - The query string.
 * @returns {Array<string>} - Array of topics sorted by relevance.
 */
export function prioritizeTopics(topicMap, query) {
  const relevanceScores = {};

  for (const topic in topicMap) {
    relevanceScores[topic] = topicMap[topic].reduce((score, entry) => {
      return score + (entry.content.toLowerCase().includes(query.toLowerCase()) ? 1 : 0);
    }, 0);
  }

  return Object.keys(relevanceScores).sort((a, b) => relevanceScores[b] - relevanceScores[a]);
}

/**
 * Example usage of the module.
 */
export function exampleUsage() {
  const memoryEntries = [
    { id: generateMemoryId('AI metacognition is fascinating'), content: 'AI metacognition is fascinating' },
    { id: generateMemoryId('Functional programming is powerful'), content: 'Functional programming is powerful' },
    { id: generateMemoryId('Neuroplasticity enables learning'), content: 'Neuroplasticity enables learning' }
  ];

  const topics = ['AI', 'programming', 'neuroplasticity'];
  let topicMap = organizeByTopics(memoryEntries, topics);

  console.log('Organized Memory:', topicMap);
  console.log('Retrieve AI Entries:', retrieveByTopic(topicMap, 'AI'));
  console.log('Prioritized Topics:', prioritizeTopics(topicMap, 'learning'));

  topicMap = addMemoryEntry(topicMap, topics, 'Biodesign is an emerging field');
  console.log('Updated Memory:', topicMap);
}
