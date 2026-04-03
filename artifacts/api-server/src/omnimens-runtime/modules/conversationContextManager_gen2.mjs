/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: conversationContextManager
 * Written: 2026-04-03T16:10:48.522Z
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
 * Compiled targets: javascript: OK (6 IR steps) | python: OK (6 IR steps) | c: OK (6 IR steps) | x86_64: OK (6 IR steps) | arm64: OK (6 IR steps) | avr: OK (6 IR steps)
 * Translation map version: 22
 */
// conversationContextManager.mjs

import crypto from 'crypto';

/**
 * Splits a long conversation into manageable segments with sliding windows and overlap.
 * Each segment is attention-weighted to prioritize important context.
 */

// Utility: Generate a hash for identifying unique conversation segments
export function generateSegmentHash(segment) {
  return crypto.createHash('sha256').update(segment).digest('hex');
}

// Utility: Split text into tokenized segments with overlap
export function splitWithSlidingWindow(text, windowSize, overlapSize) {
  if (windowSize <= overlapSize) {
    throw new Error("Window size must be greater than overlap size.");
  }

  const tokens = text.split(' '); // Simple tokenization by spaces
  const segments = [];

  for (let i = 0; i < tokens.length; i += (windowSize - overlapSize)) {
    const segment = tokens.slice(i, i + windowSize).join(' ');
    segments.push(segment);

    if (i + windowSize >= tokens.length) break; // Avoid empty trailing segment
  }

  return segments;
}

// Utility: Compute attention weights for prioritizing segments
export function computeAttentionWeights(segments, attentionFunction) {
  return segments.map(segment => ({
    segment,
    weight: attentionFunction(segment)
  })).sort((a, b) => b.weight - a.weight); // Sort by descending weight
}

// Example attention function: Prioritize segments with keywords
export function keywordAttentionFunction(segment, keywords = []) {
  const lowerSegment = segment.toLowerCase();
  const matches = keywords.filter(keyword => lowerSegment.includes(keyword.toLowerCase()));
  return matches.length; // Weight is the count of keyword matches
}

// Main: Manage conversation context with sliding window and prioritization
export function manageConversationContext(text, windowSize, overlapSize, attentionFunction, keywords = []) {
  const segments = splitWithSlidingWindow(text, windowSize, overlapSize);
  const weightedSegments = computeAttentionWeights(segments, segment => attentionFunction(segment, keywords));

  return weightedSegments.map(({ segment, weight }) => ({
    segment,
    hash: generateSegmentHash(segment),
    weight
  }));
}

// Example usage function: Process a conversation and return prioritized context
export function processConversation(text, windowSize = 50, overlapSize = 10, keywords = []) {
  return manageConversationContext(
    text,
    windowSize,
    overlapSize,
    keywordAttentionFunction,
    keywords
  );
}

// Example exported constants for reuse across agents
export const DEFAULT_WINDOW_SIZE = 50;
export const DEFAULT_OVERLAP_SIZE = 10;