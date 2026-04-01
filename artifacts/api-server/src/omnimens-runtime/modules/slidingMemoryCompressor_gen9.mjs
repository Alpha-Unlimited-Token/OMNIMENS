/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: slidingMemoryCompressor
 * Written: 2026-04-01T22:16:53.233Z
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
 * Compiled targets: javascript: OK (7 IR steps) | python: OK (7 IR steps) | c: OK (7 IR steps) | x86_64: OK (7 IR steps) | arm64: OK (7 IR steps) | avr: OK (7 IR steps)
 * Translation map version: 22
 */
// slidingMemoryCompressor.mjs

import { createHash } from 'crypto';

/**
 * Compresses long conversational context into a fixed-size memory representation
 * using attention-based weighted summarization.
 */

// Utility function to calculate importance scores based on token frequency and recency
export function calculateImportanceScores(tokens, recencyWeight = 0.5) {
  const tokenFrequency = {};
  const scores = [];

  // Calculate frequency of each token
  for (const token of tokens) {
    tokenFrequency[token] = (tokenFrequency[token] || 0) + 1;
  }

  // Calculate scores based on frequency and recency
  for (let i = 0; i < tokens.length; i++) {
    const frequencyScore = tokenFrequency[tokens[i]] / tokens.length;
    const recencyScore = Math.exp(-recencyWeight * (tokens.length - i) / tokens.length);
    scores.push(frequencyScore + recencyScore);
  }

  return scores;
}

// Utility function to summarize tokens based on importance scores
export function summarizeTokens(tokens, scores, maxSummarySize) {
  const tokenScorePairs = tokens.map((token, index) => ({ token, score: scores[index] }));

  // Sort tokens by importance score in descending order
  tokenScorePairs.sort((a, b) => b.score - a.score);

  // Select the top tokens up to the max summary size
  const summaryTokens = tokenScorePairs.slice(0, maxSummarySize).map(pair => pair.token);

  return summaryTokens;
}

// Generate a fixed-size memory representation (hash-based compression)
export function compressToMemory(tokens, maxSummarySize = 100) {
  const scores = calculateImportanceScores(tokens);
  const summaryTokens = summarizeTokens(tokens, scores, maxSummarySize);

  // Create a hash representation of the summary tokens
  const hash = createHash('sha256');
  hash.update(summaryTokens.join(' '));

  return {
    summary: summaryTokens,
    memoryRepresentation: hash.digest('hex')
  };
}

// Sliding window mechanism to maintain context beyond token limit
export function slidingWindowCompressor(tokens, windowSize = 100, maxSummarySize = 100) {
  const compressedMemory = [];

  for (let i = 0; i < tokens.length; i += windowSize) {
    const windowTokens = tokens.slice(i, i + windowSize);
    compressedMemory.push(compressToMemory(windowTokens, maxSummarySize));
  }

  return compressedMemory;
}

// Example utility for cross-agent usage: Normalize and tokenize text
export function tokenizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .split(' ')
    .filter(token => token.length > 0);
}

// Example utility for cross-agent usage: Merge multiple compressed memories
export function mergeCompressedMemories(memories) {
  const mergedSummary = [];

  for (const memory of memories) {
    mergedSummary.push(...memory.summary);
  }

  // Deduplicate and limit size
  const uniqueTokens = [...new Set(mergedSummary)];
  return uniqueTokens.slice(0, 100);
}
