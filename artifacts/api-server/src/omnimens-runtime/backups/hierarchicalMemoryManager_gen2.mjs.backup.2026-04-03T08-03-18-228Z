/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-03T03:48:25.348Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchicalMemoryManager.mjs

import { createHash } from 'crypto';

// Utility: Generate a unique hash for memory chunks
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

// Utility: Summarize a text block (basic summarization for now)
export function summarizeText(text, maxLength = 200) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Utility: Segment text into weighted chunks based on importance
export function segmentText(text, segmentSize = 500) {
  const segments = [];
  for (let i = 0; i < text.length; i += segmentSize) {
    const chunk = text.slice(i, i + segmentSize);
    segments.push({
      content: chunk,
      importance: Math.min(1, chunk.length / segmentSize), // Weight by size
    });
  }
  return segments;
}

// Core: Recursive summarization chain
export function recursiveSummarization(chunks, depth = 3) {
  if (depth === 0 || chunks.length === 1) return chunks;

  const summarizedChunks = [];
  for (let i = 0; i < chunks.length; i += 2) {
    const chunk1 = chunks[i];
    const chunk2 = chunks[i + 1] || { content: '', importance: 0 }; // Handle odd chunks
    const combinedContent = chunk1.content + ' ' + chunk2.content;
    const summary = summarizeText(combinedContent);
    summarizedChunks.push({
      content: summary,
      importance: (chunk1.importance + chunk2.importance) / 2
    });
  }

  return recursiveSummarization(summarizedChunks, depth - 1);
}

// Core: Hierarchical memory structure
export function hierarchicalMemoryManager(inputText, segmentSize = 500, depth = 3) {
  const segments = segmentText(inputText, segmentSize);
  const summarizedHierarchy = recursiveSummarization(segments, depth);

  return {
    originalText: inputText,
    segments,
    summarizedHierarchy,
    hash: generateHash(inputText)
  };
}

// Example: Utility to retrieve top-level summary
export function getTopLevelSummary(memoryStructure) {
  const { summarizedHierarchy } = memoryStructure;
  return summarizedHierarchy.length > 0 ? summarizedHierarchy[0].content : '';
}

// Example: Utility to retrieve all segment hashes
export function getSegmentHashes(memoryStructure) {
  return memoryStructure.segments.map(segment => generateHash(segment.content));
}

// Example: Utility to rebuild text from segments
export function rebuildTextFromSegments(memoryStructure) {
  return memoryStructure.segments.map(segment => segment.content).join(' ');
}
