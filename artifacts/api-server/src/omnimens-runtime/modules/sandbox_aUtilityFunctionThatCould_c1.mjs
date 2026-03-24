/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-24T03:06:46.982Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function findMostFrequentWords(text, topN) {
  if (typeof text !== 'string' || typeof topN !== 'number' || topN <= 0) {
    throw new Error('Invalid input: text must be a string and topN must be a positive number.');
  }

  const wordCounts = {};
  const words = text.toLowerCase().match(/\b[a-z]+\b/g);

  if (!words) {
    return [];
  }

  for (let word of words) {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  }

  const sortedWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(entry => ({ word: entry[0], count: entry[1] }));

  return sortedWords;
}

// Test cases
console.log(findMostFrequentWords("This is a test. This test is only a test.", 3)); // Expected: [{word: 'test', count: 3}, {word: 'this', count: 2}, {word: 'is', count: 2}]
console.log(findMostFrequentWords("AI systems are advancing rapidly. AI is reshaping industries.", 2)); // Expected: [{word: 'ai', count: 2}, {word: 'systems', count: 1}]
console.log(findMostFrequentWords("", 5)); // Expected: []
console.log(findMostFrequentWords("Singleword", 1)); // Expected: [{word: 'singleword', count: 1}]
console.log(findMostFrequentWords("Repeat repeat repeat.", 1)); // Expected: [{word: 'repeat', count: 3}]