/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-22T21:02:23.191Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function findMostFrequentPatterns(text, patternLength) {
  if (typeof text !== 'string' || typeof patternLength !== 'number' || patternLength <= 0) {
    throw new Error('Invalid input: text must be a string and patternLength must be a positive number.');
  }

  const patternFrequency = new Map();

  for (let i = 0; i <= text.length - patternLength; i++) {
    const pattern = text.slice(i, i + patternLength);
    patternFrequency.set(pattern, (patternFrequency.get(pattern) || 0) + 1);
  }

  const sortedPatterns = Array.from(patternFrequency.entries()).sort((a, b) => b[1] - a[1]);

  return sortedPatterns;
}

// Test cases
console.log('Test Case 1:');
const text1 = 'abcabcabc';
const patterns1 = findMostFrequentPatterns(text1, 3);
console.log(patterns1); // Expected: [['abc', 3]]

console.log('Test Case 2:');
const text2 = 'abababab';
const patterns2 = findMostFrequentPatterns(text2, 2);
console.log(patterns2); // Expected: [['ab', 4], ['ba', 3]]

console.log('Test Case 3:');
const text3 = 'aaaaaa';
const patterns3 = findMostFrequentPatterns(text3, 2);
console.log(patterns3); // Expected: [['aa', 5]]

console.log('Test Case 4 (Edge Case):');
const text4 = 'abcdef';
const patterns4 = findMostFrequentPatterns(text4, 1);
console.log(patterns4); // Expected: [['a', 1], ['b', 1], ['c', 1], ['d', 1], ['e', 1], ['f', 1]]

console.log('Test Case 5 (Edge Case):');
const text5 = 'abc';
const patterns5 = findMostFrequentPatterns(text5, 4);
console.log(patterns5); // Expected: [] (patternLength exceeds text length)