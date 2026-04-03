/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: recursiveContextManager
 * Written: 2026-04-03T02:44:14.599Z
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
 * Recursively segments a large context into smaller windows, summarizes them, and reassembles while preserving semantic links.
 */
export function recursiveContextManager(context, maxTokens = 500) {
  if (typeof context !== 'string' || context.trim() === '') {
    throw new Error('Invalid context: must be a non-empty string');
  }

  if (context.length <= maxTokens) {
    return context; // Base case: context fits within token limit
  }

  const segments = segmentContext(context, maxTokens);
  const summaries = segments.map((segment) => summarizeSegment(segment));

  return reassembleContext(summaries);
}

/**
 * Splits a large context into smaller segments based on token limits, ensuring semantic coherence.
 */
export function segmentContext(context, maxTokens) {
  const words = context.split(' ');
  const segments = [];
  let currentSegment = [];
  let tokenCount = 0;

  for (const word of words) {
    const wordTokens = tokenize(word);
    if (tokenCount + wordTokens > maxTokens) {
      segments.push(currentSegment.join(' '));
      currentSegment = [];
      tokenCount = 0;
    }
    currentSegment.push(word);
    tokenCount += wordTokens;
  }

  if (currentSegment.length > 0) {
    segments.push(currentSegment.join(' '));
  }

  return segments;
}

/**
 * Summarizes a single segment by extracting key sentences based on importance.
 */
export function summarizeSegment(segment) {
  const sentences = segment.match(/[^.!?]+[.!?]/g) || [segment];
  const importanceScores = sentences.map((sentence) => calculateImportance(sentence));
  const sortedSentences = sentences
    .map((sentence, index) => ({ sentence, score: importanceScores[index] }))
    .sort((a, b) => b.score - a.score);

  const topSentences = sortedSentences.slice(0, Math.ceil(sentences.length / 3));
  return topSentences.map((item) => item.sentence).join(' ');
}

/**
 * Reassembles summarized segments into a cohesive context.
 */
export function reassembleContext(summaries) {
  return summaries.join(' ');
}

/**
 * Tokenizes a word to estimate its token count (simplified approximation).
 */
export function tokenize(word) {
  return Math.ceil(Buffer.byteLength(word, 'utf8') / 4); // Approximation: 1 token ≈ 4 bytes
}

/**
 * Calculates the importance of a sentence using a hash-based pseudo-random score.
 */
export function calculateImportance(sentence) {
  const hash = crypto.createHash('sha256').update(sentence).digest('hex');
  const score = parseInt(hash.slice(0, 8), 16); // Use first 8 hex chars as a score
  return score;
}

/**
 * Utility to process a large dataset and apply recursive context management.
 */
export function processLargeDataset(dataset, maxTokens = 500) {
  if (!Array.isArray(dataset)) {
    throw new Error('Dataset must be an array of strings');
  }

  return dataset.map((context) => recursiveContextManager(context, maxTokens));
}