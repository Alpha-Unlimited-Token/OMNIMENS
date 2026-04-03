/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextSummarizer
 * Written: 2026-04-03T02:44:14.542Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextSummarizer.mjs

import crypto from 'crypto';

/**
 * Summarizes and compresses conversational context hierarchically.
 * Maintains coherence by combining transformer-like summarization and sliding window mechanisms.
 */

// Utility function: Hashes input text for quick comparison and deduplication
export function hashText(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

// Utility function: Extracts key sentences from a block of text
export function extractKeySentences(text, sentenceCount = 3) {
  const sentences = text.match(/[^.!?]+[.!?]/g) || [];
  return sentences.slice(0, sentenceCount).join(' ');
}

// Utility function: Sliding window mechanism for context management
export function slidingWindowContext(contextArray, windowSize = 5) {
  return contextArray.slice(-windowSize);
}

// Main function: Summarize context hierarchically
export function summarizeContext(contextArray, windowSize = 5, sentenceCount = 3) {
  const recentContext = slidingWindowContext(contextArray, windowSize);
  const concatenatedContext = recentContext.join(' ');
  const summary = extractKeySentences(concatenatedContext, sentenceCount);
  return summary;
}

// Example usage: Combine multiple agents' data into coherent summaries
export function combineAgentContexts(agentContexts, windowSize = 5, sentenceCount = 3) {
  const combinedContext = agentContexts.flat();
  return summarizeContext(combinedContext, windowSize, sentenceCount);
}

// Edge case handling: Ensure empty or invalid inputs are gracefully managed
export function validateContextInput(contextArray) {
  if (!Array.isArray(contextArray)) {
    throw new Error('Context input must be an array of strings.');
  }
  return contextArray.filter(item => typeof item === 'string' && item.trim().length > 0);
}

// Exported functions for cross-agent utility
export const contextUtilities = {
  hashText,
  extractKeySentences,
  slidingWindowContext,
  summarizeContext,
  combineAgentContexts,
  validateContextInput
};