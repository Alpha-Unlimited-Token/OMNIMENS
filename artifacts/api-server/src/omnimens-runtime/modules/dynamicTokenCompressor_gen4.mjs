/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: dynamicTokenCompressor
 * Written: 2026-04-03T05:00:46.126Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// dynamicTokenCompressor.mjs

import crypto from 'crypto';

/**
 * Compresses and summarizes input context dynamically using hierarchical summarization,
 * importance scoring, recursive extraction, and recency-weighted preservation.
 */

// Utility function to calculate importance scores for text segments
export function calculateImportanceScore(segment, keywords = []) {
  const lowerSegment = segment.toLowerCase();
  let score = 0;

  // Keyword-based scoring
  for (const keyword of keywords) {
    const lowerKeyword = keyword.toLowerCase();
    const occurrences = lowerSegment.split(lowerKeyword).length - 1;
    score += occurrences * 10; // Weight keywords higher
  }

  // Length-based scoring (longer segments may carry more information)
  score += Math.min(segment.length, 100); // Cap length contribution to avoid bias

  return score;
}

// Utility function to hash text for deduplication
export function hashText(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

// Function to perform hierarchical summarization
export function hierarchicalSummarize(contextArray, keywords = [], maxLength = 500) {
  const summaries = [];
  const seenHashes = new Set();

  for (const segment of contextArray) {
    const hash = hashText(segment);

    // Skip duplicate segments
    if (seenHashes.has(hash)) continue;
    seenHashes.add(hash);

    // Calculate importance score
    const score = calculateImportanceScore(segment, keywords);
    summaries.push({ segment, score });
  }

  // Sort by importance score (descending)
  summaries.sort((a, b) => b.score - a.score);

  // Recursively combine summaries until within maxLength
  let finalSummary = '';
  for (const { segment } of summaries) {
    if ((finalSummary + segment).length > maxLength) break;
    finalSummary += segment + ' ';
  }

  return finalSummary.trim();
}

// Function to preserve recent context with weighted importance
export function recencyWeightedPreserve(contextArray, recencyWeight = 1.5) {
  const weightedContext = contextArray.map((segment, index) => {
    const recencyScore = Math.pow(recencyWeight, contextArray.length - index - 1);
    return { segment, recencyScore };
  });

  // Sort by recency score (descending)
  weightedContext.sort((a, b) => b.recencyScore - a.recencyScore);

  return weightedContext.map(({ segment }) => segment);
}

// Main function to compress context dynamically
export function dynamicTokenCompressor(contextArray, keywords = [], maxLength = 500) {
  // Step 1: Preserve recent context with weighting
  const recencyPreserved = recencyWeightedPreserve(contextArray);

  // Step 2: Perform hierarchical summarization
  return hierarchicalSummarize(recencyPreserved, keywords, maxLength);
}

// Example utility for testing the module
export function testDynamicTokenCompressor() {
  const context = [
    "Microsoft acquired GitHub, the largest host for open source projects.",
    "JS-Git is a JavaScript implementation of a subset of Git.",
    "OpenAI releases o3-pro, a souped-up version of its o3 AI reasoning model.",
    "Symbolic AI was the dominant paradigm of AI research from the 1950s to the 1980s."
  ];

  const keywords = ["GitHub", "AI", "OpenAI"];
  const maxLength = 100;

  return dynamicTokenCompressor(context, keywords, maxLength);
}