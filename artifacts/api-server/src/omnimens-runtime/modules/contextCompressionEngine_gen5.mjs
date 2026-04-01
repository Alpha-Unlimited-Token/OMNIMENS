/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextCompressionEngine
 * Written: 2026-04-01T22:11:06.790Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextCompressionEngine.mjs

import { createHash } from 'crypto';

/**
 * Summarizes and compresses text dynamically to retain critical information.
 * This module provides utility functions for extractive summarization and token prioritization.
 */

// Utility function to hash strings for unique identification
export function hashString(input) {
  return createHash('sha256').update(input).digest('hex');
}

// Tokenize text into words (basic whitespace and punctuation splitting)
export function tokenize(text) {
  return text.match(/\b\w+\b/g) || [];
}

// Calculate term frequency (TF) for each token in the text
export function calculateTermFrequency(tokens) {
  const frequency = {};
  tokens.forEach(token => {
    const lowerToken = token.toLowerCase();
    frequency[lowerToken] = (frequency[lowerToken] || 0) + 1;
  });
  return frequency;
}

// Rank sentences based on token importance using a simplified TextRank-like algorithm
export function rankSentences(text, tokenWeights) {
  const sentences = text.match(/[^.!?]+[.!?]/g) || [text];
  const sentenceScores = sentences.map(sentence => {
    const tokens = tokenize(sentence);
    const score = tokens.reduce((sum, token) => sum + (tokenWeights[token.toLowerCase()] || 0), 0);
    return { sentence, score };
  });

  // Sort sentences by score in descending order
  sentenceScores.sort((a, b) => b.score - a.score);
  return sentenceScores;
}

// Compress context by summarizing and retaining key sentences
export function compressContext(text, maxSentences = 3) {
  const tokens = tokenize(text);
  const termFrequency = calculateTermFrequency(tokens);

  // Rank sentences based on term frequency
  const rankedSentences = rankSentences(text, termFrequency);

  // Select the top N sentences
  const summary = rankedSentences.slice(0, maxSentences).map(item => item.sentence).join(' ');
  return summary;
}

// Utility function to normalize text for consistent processing
export function normalizeText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

// Example function to demonstrate cross-agent utility
export function summarizeAndHash(text, maxSentences = 3) {
  const normalizedText = normalizeText(text);
  const summary = compressContext(normalizedText, maxSentences);
  const summaryHash = hashString(summary);
  return { summary, hash: summaryHash };
}

// Exported functions are designed to be reusable across agents for text processing tasks
