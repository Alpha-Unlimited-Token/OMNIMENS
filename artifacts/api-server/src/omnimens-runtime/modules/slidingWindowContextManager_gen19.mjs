/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: slidingWindowContextManager
 * Written: 2026-04-01T22:23:03.690Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * TRANSLATION STATUS:
 * Novel constructs: attention
 * All constructs have translation mappings
 * Compiled targets: javascript: OK (4 IR steps) | python: OK (4 IR steps) | c: OK (4 IR steps) | x86_64: OK (4 IR steps) | arm64: OK (4 IR steps) | avr: OK (4 IR steps)
 * Translation map version: 22
 */
// slidingWindowContextManager.mjs

import { createHash } from 'crypto';

/**
 * Dynamically manages context relevance using a sliding window approach.
 * Provides utilities for scoring, segmenting, and prioritizing context.
 */

/**
 * Calculates relevance scores for context segments based on attention-weighted keywords.
 * @param {Array<string>} contextSegments - Array of context segments (strings).
 * @param {Array<string>} keywords - Keywords to prioritize.
 * @returns {Array<{ segment, score}>} - Array of objects with segment and its relevance score.
 */
export function calculateRelevanceScores(contextSegments, keywords) {
  const keywordSet = new Set(keywords.map(k => k.toLowerCase()));

  return contextSegments.map(segment => {
    const words = segment.toLowerCase().split(/\s+/);
    const score = words.reduce((acc, word) => acc + (keywordSet.has(word) ? 1 : 0), 0);
    return { segment, score };
  });
}

/**
 * Segments a large text into smaller chunks based on a fixed window size.
 * @param {string} text - The full context text.
 * @param {number} windowSize - Maximum number of words per segment.
 * @returns {Array<string>} - Array of text segments.
 */
export function segmentText(text, windowSize) {
  const words = text.split(/\s+/);
  const segments = [];

  for (let i = 0; i < words.length; i += windowSize) {
    segments.push(words.slice(i, i + windowSize).join(' '));
  }

  return segments;
}

/**
 * Prioritizes context segments by relevance, retaining only the top N segments.
 * @param {Array<{ segment, score}>} scoredSegments - Array of scored context segments.
 * @param {number} retainCount - Number of top segments to retain.
 * @returns {Array<string>} - Array of retained context segments.
 */
export function prioritizeSegments(scoredSegments, retainCount) {
  return scoredSegments
    .sort((a, b) => b.score - a.score)
    .slice(0, retainCount)
    .map(entry => entry.segment);
}

/**
 * Generates a deterministic hash for a context segment (useful for deduplication).
 * @param {string} segment - Context segment.
 * @returns {string} - SHA-256 hash of the segment.
 */
export function hashSegment(segment) {
  return createHash('sha256').update(segment).digest('hex');
}

/**
 * Main utility function to manage context dynamically.
 * @param {string} text - Full context text.
 * @param {Array<string>} keywords - Keywords to prioritize.
 * @param {number} windowSize - Maximum number of words per segment.
 * @param {number} retainCount - Number of top segments to retain.
 * @returns {Array<string>} - Array of prioritized context segments.
 */
export function slidingWindowContextManager(text, keywords, windowSize, retainCount) {
  const segments = segmentText(text, windowSize);
  const scoredSegments = calculateRelevanceScores(segments, keywords);
  return prioritizeSegments(scoredSegments, retainCount);
}

/**
 * Utility for cross-agent use: Filters out duplicate context segments.
 * @param {Array<string>} segments - Array of context segments.
 * @returns {Array<string>} - Array of unique context segments.
 */
export function deduplicateSegments(segments) {
  const seenHashes = new Set();
  return segments.filter(segment => {
    const hash = hashSegment(segment);
    if (seenHashes.has(hash)) return false;
    seenHashes.add(hash);
    return true;
  });
}

/**
 * Utility for cross-agent use: Combines multiple contexts into a single prioritized list.
 * @param {Array<{ text, keywords }>} contexts - Array of context objects with text and keywords.
 * @param {number} windowSize - Maximum number of words per segment.
 * @param {number} retainCount - Number of top segments to retain.
 * @returns {Array<string>} - Array of combined prioritized context segments.
 */
export function combineAndPrioritizeContexts(contexts, windowSize, retainCount) {
  const allSegments = contexts.flatMap(({ text, keywords }) => {
    const segments = segmentText(text, windowSize);
    const scoredSegments = calculateRelevanceScores(segments, keywords);
    return prioritizeSegments(scoredSegments, retainCount);
  });

  return deduplicateSegments(allSegments);
}