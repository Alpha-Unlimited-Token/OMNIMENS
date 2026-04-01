/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextSlidingWindow
 * Written: 2026-04-01T22:00:07.852Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextSlidingWindow.mjs

// Utility function to split text into overlapping chunks
export function splitIntoChunks(text, chunkSize, overlap) {
  if (chunkSize <= overlap) {
    throw new Error("chunkSize must be greater than overlap.");
  }

  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    const chunk = text.slice(i, i + chunkSize);
    chunks.push(chunk);
    if (chunk.length < chunkSize) break; // Stop if the last chunk is smaller than chunkSize
  }
  return chunks;
}

// Utility function to summarize text chunks into a cohesive context
export function summarizeChunks(chunks, summarizerFunction) {
  if (typeof summarizerFunction !== "function") {
    throw new Error("summarizerFunction must be a valid function.");
  }

  let context = "";
  for (const chunk of chunks) {
    context = summarizerFunction(context, chunk);
  }
  return context;
}

// Example summarizer function (can be replaced with more advanced logic)
export function simpleSummarizer(previousContext, newChunk) {
  return `${previousContext} ${newChunk}`.trim();
}

// Main function to process text with sliding window and summarization
export function processWithSlidingWindow(text, chunkSize = 100, overlap = 20, summarizerFunction = simpleSummarizer) {
  if (typeof text !== "string" || text.length === 0) {
    throw new Error("Input text must be a non-empty string.");
  }
  if (chunkSize <= 0 || overlap < 0) {
    throw new Error("chunkSize must be positive and overlap must be non-negative.");
  }

  const chunks = splitIntoChunks(text, chunkSize, overlap);
  return summarizeChunks(chunks, summarizerFunction);
}

// Utility function for token estimation (basic approximation for text processing agents)
export function estimateTokenCount(text) {
  if (typeof text !== "string") {
    throw new Error("Input must be a string.");
  }
  return text.split(/\s+/).length; // Approximation: 1 token per word
}

// Example usage (can be removed in production):
// const text = "This is a long text that needs to be processed with a sliding window technique to maintain context across token limits.";
// const result = processWithSlidingWindow(text, 50, 10);
// console.log(result);