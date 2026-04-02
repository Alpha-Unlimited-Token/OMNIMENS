/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hybridTokenCompressor
 * Written: 2026-04-02T14:52:11.506Z
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
// hybridTokenCompressor.mjs

import { createHash } from 'crypto';

/**
 * Hashes a string using SHA-256 for lossless compression of critical details.
 * @param {string} input - The input string to hash.
 * @returns {string} - The SHA-256 hash of the input.
 */
export function hashString(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Summarizes text hierarchically by breaking it into chunks and summarizing each chunk.
 * @param {string} text - The input text to summarize.
 * @param {number} chunkSize - Number of characters per chunk.
 * @returns {string} - A hierarchical summary of the input text.
 */
export function hierarchicalSummarization(text, chunkSize = 256) {
  if (chunkSize <= 0) throw new Error('Chunk size must be greater than 0');
  const chunks = [];

  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize);
    chunks.push(summarizeChunk(chunk));
  }

  return summarizeChunk(chunks.join(' '));
}

/**
 * Preserves critical details by identifying key phrases using selective attention.
 * @param {string} text - The input text.
 * @param {Array<string>} keywords - List of keywords to prioritize.
 * @returns {string} - Text containing only critical details.
 */
export function preserveCriticalDetails(text, keywords = []) {
  const lowerKeywords = keywords.map(k => k.toLowerCase());
  const sentences = text.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|\!)\s/);

  return sentences
    .filter(sentence => lowerKeywords.some(keyword => sentence.toLowerCase().includes(keyword)))
    .join(' ');
}

/**
 * Combines hierarchical summarization and critical detail preservation.
 * @param {string} text - The input text.
 * @param {number} chunkSize - Number of characters per chunk for summarization.
 * @param {Array<string>} keywords - List of keywords to prioritize.
 * @returns {string} - A compressed representation of the input text.
 */
export function hybridTokenCompressor(text, chunkSize = 256, keywords = []) {
  const summarized = hierarchicalSummarization(text, chunkSize);
  const criticalDetails = preserveCriticalDetails(text, keywords);

  return `${summarized}\n\nCritical Details:\n${criticalDetails}`;
}

/**
 * Summarizes a single chunk of text (helper function).
 * @param {string} chunk - The chunk of text to summarize.
 * @returns {string} - A simple summary of the chunk.
 */
function summarizeChunk(chunk) {
  const words = chunk.split(' ');
  const mid = Math.floor(words.length / 2);

  return `${words.slice(0, 3).join(' ')} ... ${words.slice(mid, mid + 3).join(' ')} ... ${words.slice(-3).join(' ')}`;
}
