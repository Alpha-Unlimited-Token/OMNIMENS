/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-03T05:40:20.236Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchicalMemoryManager.mjs

import crypto from 'crypto';

/**
 * Generate a unique ID for memory segments.
 * @returns {string} A unique identifier.
 */
export function generateSegmentId() {
  return crypto.randomUUID();
}

/**
 * Summarizes a text segment by truncating or extracting key points.
 * @param {string} text - The text to summarize.
 * @param {number} maxLength - The maximum length of the summary.
 * @returns {string} A summarized version of the text.
 */
export function summarizeText(text, maxLength = 200) {
  if (text.length <= maxLength) return text;
  const sentences = text.split('. ');
  let summary = '';

  for (const sentence of sentences) {
    if ((summary + sentence).length > maxLength) break;
    summary += sentence + '. ';
  }

  return summary.trim();
}

/**
 * Scores segments based on their importance (e.g., recency, length, keywords).
 * @param {Array<{ id, content, timestamp}>} segments - Memory segments.
 * @param {Array<string>} keywords - Keywords to prioritize.
 * @returns {Array<{ id, score}>} Scored segments.
 */
export function scoreSegments(segments, keywords = []) {
  return segments.map(({ id, content, timestamp }) => {
    let score = 0;

    // Prioritize recent segments
    const age = Date.now() - timestamp;
    score += Math.max(0, 10000 - age / 1000); // Decay over time

    // Prioritize segments containing keywords
    for (const keyword of keywords) {
      if (content.includes(keyword)) score += 50;
    }

    // Prioritize longer content (but not excessively)
    score += Math.min(content.length, 500) / 10;

    return { id, score };
  });
}

/**
 * Compress memory by summarizing and retaining high-priority segments.
 * @param {Array<{ id, content, timestamp}>} segments - Memory segments.
 * @param {number} maxSegments - Maximum number of segments to retain.
 * @param {Array<string>} keywords - Keywords to prioritize.
 * @returns {Array<{ id, content, timestamp}>} Compressed memory.
 */
export function compressMemory(segments, maxSegments = 10, keywords = []) {
  const scoredSegments = scoreSegments(segments, keywords);

  // Sort by score descending
  scoredSegments.sort((a, b) => b.score - a.score);

  // Retain top segments and summarize if necessary
  const retained = scoredSegments.slice(0, maxSegments).map(({ id }) => {
    const segment = segments.find(s => s.id === id);
    return {
      id: segment.id,
      content: summarizeText(segment.content),
      timestamp: segment.timestamp
    };
  });

  return retained;
}

/**
 * Recursive summarization for deep memory compression.
 * @param {Array<{ id, content, timestamp}>} segments - Memory segments.
 * @param {number} depth - Number of recursive summarization layers.
 * @returns {Array<{ id, content, timestamp}>} Compressed memory.
 */
export function recursiveSummarization(segments, depth = 2) {
  let compressed = segments;

  for (let i = 0; i < depth; i++) {
    compressed = compressMemory(compressed, Math.ceil(compressed.length / 2));
  }

  return compressed;
}

/**
 * Example usage: Initialize memory and demonstrate compression.
 */
export function exampleUsage() {
  const memory = [
    { id: generateSegmentId(), content: 'This is a very important memory.', timestamp: Date.now() - 1000 },
    { id: generateSegmentId(), content: 'This is another memory that is slightly less important.', timestamp: Date.now() - 5000 },
    { id: generateSegmentId(), content: 'A trivial memory.', timestamp: Date.now() - 10000 }
  ];

  const compressed = recursiveSummarization(memory, 2);
  return compressed;
}
