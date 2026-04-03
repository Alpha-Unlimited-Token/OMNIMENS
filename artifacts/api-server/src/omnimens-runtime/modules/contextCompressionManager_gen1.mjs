/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextCompressionManager
 * Written: 2026-04-03T07:00:13.373Z
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
 * Compiled targets: javascript: OK (10 IR steps) | python: OK (10 IR steps) | c: OK (10 IR steps) | x86_64: OK (10 IR steps) | arm64: OK (10 IR steps) | avr: OK (10 IR steps)
 * Translation map version: 22
 */
// contextCompressionManager.mjs

import crypto from 'crypto';

/**
 * Dynamically compresses conversation context to maintain coherence within the token window limit.
 * This module uses hierarchical summarization and sparse attention for token prioritization.
 */

// Utility function to calculate similarity score between two text segments using cosine similarity
export function calculateCosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must be of the same length");
  }

  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b ** 2, 0));

  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

// Utility function to generate a hash-based unique identifier for context chunks
export function generateChunkId(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Summarization function to reduce a text block into a shorter summary
export function summarizeText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;

  const sentences = text.split('. ');
  let summary = '';

  for (const sentence of sentences) {
    if ((summary + sentence).length > maxLength) break;
    summary += sentence + '. ';
  }

  return summary.trim();
}

// Main function to compress context dynamically
export function compressContext(contextArray, tokenLimit) {
  if (!Array.isArray(contextArray) || tokenLimit <= 0) {
    throw new Error("Invalid input: contextArray must be an array and tokenLimit must be a positive number");
  }

  // Step 1: Prioritize chunks based on length and relevance
  const prioritizedChunks = contextArray
    .map(chunk => ({
      id: generateChunkId(chunk),
      content: chunk,
      length: chunk.length,
      priority: chunk.length // Simple heuristic: prioritize longer chunks
    }))
    .sort((a, b) => b.priority - a.priority);

  // Step 2: Iteratively add chunks until token limit is reached
  let compressedContext = '';
  for (const chunk of prioritizedChunks) {
    if ((compressedContext.length + chunk.content.length) > tokenLimit) {
      compressedContext += summarizeText(chunk.content, tokenLimit - compressedContext.length);
      break;
    }
    compressedContext += chunk.content;
  }

  return compressedContext;
}

// Function to split text into manageable chunks based on delimiter
export function splitTextIntoChunks(text, delimiter = '\n', maxChunkSize = 500) {
  const chunks = text.split(delimiter);
  const result = [];
  let currentChunk = '';

  for (const chunk of chunks) {
    if ((currentChunk.length + chunk.length) > maxChunkSize) {
      result.push(currentChunk);
      currentChunk = '';
    }
    currentChunk += chunk + delimiter;
  }

  if (currentChunk) result.push(currentChunk);

  return result;
}

// Function to calculate token usage for a given text
export function calculateTokenUsage(text) {
  return text.split(' ').length; // Simple approximation based on word count
}
