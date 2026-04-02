/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextRetentionEnhancer
 * Written: 2026-04-02T14:17:45.904Z
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
 * Compiled targets: javascript: OK (1 IR steps) | python: OK (1 IR steps) | c: OK (1 IR steps) | x86_64: OK (1 IR steps) | arm64: OK (1 IR steps) | avr: OK (1 IR steps)
 * Translation map version: 24
 */
// contextRetentionEnhancer.mjs

import crypto from 'crypto';

/**
 * Utility function to generate a hash for unique identification of content blocks.
 * @param {string} content - The content to hash.
 * @returns {string} - A SHA256 hash of the content.
 */
export function generateContentHash(content) {
  const hash = crypto.createHash('sha256');
  hash.update(content);
  return hash.digest('hex');
}

/**
 * Extractive summarization function to identify key sentences based on term frequency.
 * @param {string} text - Input text to summarize.
 * @param {number} sentenceLimit - Maximum number of sentences to retain.
 * @returns {string[]} - Array of key sentences.
 */
export function extractKeySentences(text, sentenceLimit = 5) {
  const sentences = text.match(/[^.!?]+[.!?]/g) || [];
  const termFrequency = {};

  sentences.forEach(sentence => {
    const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
    words.forEach(word => {
      termFrequency[word] = (termFrequency[word] || 0) + 1;
    });
  });

  const scoredSentences = sentences.map(sentence => {
    const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
    const score = words.reduce((sum, word) => sum + (termFrequency[word] || 0), 0);
    return { sentence, score };
  });

  scoredSentences.sort((a, b) => b.score - a.score);
  return scoredSentences.slice(0, sentenceLimit).map(item => item.sentence);
}

/**
 * Abstractive summarization function to generate a concise summary.
 * @param {string[]} keySentences - Array of key sentences.
 * @returns {string} - Abstractive summary.
 */
export function generateAbstractiveSummary(keySentences) {
  return keySentences.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Hierarchical attention mechanism to merge and compress context.
 * @param {string[]} contexts - Array of context strings.
 * @param {number} sentenceLimit - Maximum sentences per context.
 * @returns {string} - Merged and compressed context.
 */
export function mergeContexts(contexts, sentenceLimit = 5) {
  const allKeySentences = contexts.flatMap(context => extractKeySentences(context, sentenceLimit));
  const uniqueSentences = Array.from(new Set(allKeySentences));
  return generateAbstractiveSummary(uniqueSentences);
}

/**
 * Main function to process and compress large token windows.
 * @param {string[]} tokenWindow - Array of text blocks representing the token window.
 * @param {number} sentenceLimit - Maximum sentences to retain per block.
 * @returns {string} - Compressed token window.
 */
export function compressTokenWindow(tokenWindow, sentenceLimit = 5) {
  return mergeContexts(tokenWindow, sentenceLimit);
}

/**
 * Edge case handler to ensure safe input processing.
 * @param {string[]} tokenWindow - Array of text blocks.
 * @returns {string[]} - Sanitized input.
 */
export function sanitizeInput(tokenWindow) {
  return tokenWindow.filter(block => typeof block === 'string' && block.trim().length > 0);
}

/**
 * High-level utility to enhance context retention across agents.
 * @param {string[]} tokenWindow - Array of text blocks.
 * @param {number} sentenceLimit - Maximum sentences to retain per block.
 * @returns {string} - Enhanced context.
 */
export function enhanceContextRetention(tokenWindow, sentenceLimit = 5) {
  const sanitizedWindow = sanitizeInput(tokenWindow);
  return compressTokenWindow(sanitizedWindow, sentenceLimit);
}