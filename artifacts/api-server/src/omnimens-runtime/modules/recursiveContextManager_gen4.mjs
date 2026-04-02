/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: recursiveContextManager
 * Written: 2026-04-02T20:35:13.357Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// recursiveContextManager.mjs

import crypto from 'crypto';

/**
 * Generates a unique hash for a given string input to ensure unique topic identifiers.
 * @param {string} input - The string to hash.
 * @returns {string} - A unique hash based on the input.
 */
export function generateHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Segments a given text into hierarchical topics based on delimiters and patterns.
 * @param {string} text - The input text to segment.
 * @param {RegExp} delimiter - A regular expression to identify topic boundaries.
 * @returns {Array} - An array of hierarchical topics.
 */
export function segmentText(text, delimiter = /\n\n|\.|\n/) {
  const segments = text.split(delimiter).map((segment) => segment.trim()).filter(Boolean);
  return segments.map((segment) => ({
    id: generateHash(segment),
    content: segment,
    importance: 0,
    subtopics: []
  }));
}

/**
 * Recursively expands compressed context by evaluating importance weights and interconnections.
 * @param {Array} topics - Array of hierarchical topic objects.
 * @param {Function} importanceFunction - A function to calculate importance of a topic.
 * @param {number} threshold - Minimum importance to expand a topic.
 * @returns {Array} - Expanded hierarchical topics.
 */
export function expandContext(topics, importanceFunction, threshold = 0.5) {
  return topics.map((topic) => {
    topic.importance = importanceFunction(topic.content);
    if (topic.importance >= threshold && topic.subtopics.length > 0) {
      topic.subtopics = expandContext(topic.subtopics, importanceFunction, threshold);
    }
    return topic;
  });
}

/**
 * Calculates importance of a topic based on its length and keyword density.
 * @param {string} content - The content of the topic.
 * @returns {number} - Importance score between 0 and 1.
 */
export function calculateImportance(content) {
  const keywords = ['AI', 'breakthrough', 'paradigm', 'emerging', 'Gemini'];
  const keywordCount = keywords.reduce((count, keyword) => count + (content.includes(keyword) ? 1 : 0), 0);
  const lengthScore = Math.min(content.length / 500, 1); // Normalize length to max score of 1
  const keywordScore = Math.min(keywordCount / keywords.length, 1);
  return (lengthScore + keywordScore) / 2; // Average of length and keyword density
}

/**
 * Flattens a hierarchical topic structure into a single array for easier processing.
 * @param {Array} topics - Array of hierarchical topic objects.
 * @returns {Array} - Flattened array of topics.
 */
export function flattenTopics(topics) {
  const flat = [];
  topics.forEach((topic) => {
    flat.push({ id: topic.id, content: topic.content, importance: topic.importance });
    if (topic.subtopics.length > 0) {
      flat.push(...flattenTopics(topic.subtopics));
    }
  });
  return flat;
}

/**
 * Main function to process and expand compressed context.
 * @param {string} text - The compressed input text.
 * @param {RegExp} delimiter - A regular expression to identify topic boundaries.
 * @param {number} threshold - Minimum importance to expand a topic.
 * @returns {Array} - Fully expanded hierarchical topics.
 */
export function processContext(text, delimiter = /\n\n|\.|\n/, threshold = 0.5) {
  const topics = segmentText(text, delimiter);
  const expandedTopics = expandContext(topics, calculateImportance, threshold);
  return expandedTopics;
}

/**
 * Utility function to summarize the most important topics from the expanded context.
 * @param {Array} topics - Array of hierarchical topic objects.
 * @param {number} topN - Number of top topics to return.
 * @returns {Array} - Top N most important topics.
 */
export function summarizeTopTopics(topics, topN = 5) {
  const flatTopics = flattenTopics(topics);
  return flatTopics.sort((a, b) => b.importance - a.importance).slice(0, topN);
}
