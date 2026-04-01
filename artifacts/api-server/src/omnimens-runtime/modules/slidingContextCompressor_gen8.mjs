/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: slidingContextCompressor
 * Written: 2026-04-01T22:22:01.969Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// slidingContextCompressor.mjs

import { createHash } from 'crypto';

/**
 * Compresses and retains essential context from long conversations using hierarchical summarization.
 * This utility is designed to be reusable across multiple agents.
 */

// Utility function to hash strings for efficient deduplication
export function hashString(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

// Function to split text into chunks of a specified size
export function splitIntoChunks(text, chunkSize) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

// Function to perform a basic summarization of a chunk of text
export function summarizeChunk(chunk) {
  const sentences = chunk.split('.');
  const keySentences = sentences.filter((sentence) => sentence.includes('important') || sentence.includes('key'));
  return keySentences.join('. ') || sentences.slice(0, 2).join('. '); // Fallback to the first 2 sentences
}

// Function to hierarchically summarize a large text input
export function hierarchicalSummarization(text, chunkSize = 500) {
  const chunks = splitIntoChunks(text, chunkSize);
  const summaries = chunks.map(summarizeChunk);
  const combinedSummary = summaries.join(' ');

  // Perform a second summarization pass if the combined summary is still too long
  if (combinedSummary.length > chunkSize) {
    return hierarchicalSummarization(combinedSummary, chunkSize);
  }

  return combinedSummary;
}

// Function to compress and retain essential context from a conversation
export function compressContext(conversation, tokenLimit = 2000) {
  const contextHashes = new Set();
  const compressedContext = [];

  for (const message of conversation) {
    const messageHash = hashString(message);

    // Avoid adding duplicate messages
    if (!contextHashes.has(messageHash)) {
      contextHashes.add(messageHash);
      compressedContext.push(message);
    }

    // Stop if the compressed context exceeds the token limit
    if (compressedContext.join(' ').length > tokenLimit) {
      break;
    }
  }

  // Perform hierarchical summarization on the compressed context
  return hierarchicalSummarization(compressedContext.join(' '), Math.floor(tokenLimit / 2));
}

// Example usage function (not exported)
function example() {
  const conversation = [
    "This is an important message about the project timeline.",
    "Another key point to consider is the budget constraints.",
    "This is a redundant message about the project timeline.",
    "We should focus on the key deliverables for this quarter.",
    "Remember to address the client feedback in the next meeting."
  ];

  const compressed = compressContext(conversation, 100);
  console.log('Compressed Context:', compressed);
}

// Uncomment the following line to run the example
// example();