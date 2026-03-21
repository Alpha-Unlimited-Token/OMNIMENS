/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-21T05:02:24.374Z
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

    const patternMap = new Map();

    for (let i = 0; i <= text.length - patternLength; i++) {
        const pattern = text.substring(i, i + patternLength);
        patternMap.set(pattern, (patternMap.get(pattern) || 0) + 1);
    }

    const sortedPatterns = Array.from(patternMap.entries()).sort((a, b) => b[1] - a[1]);

    return sortedPatterns.map(([pattern, count]) => ({ pattern, count }));
}

// Self-tests
console.log("Test Case 1: Basic functionality");
const text1 = "abababab";
const patterns1 = findMostFrequentPatterns(text1, 2);
console.log(patterns1); // Expected: [{ pattern: 'ab', count: 4 }, { pattern: 'ba', count: 3 }]

console.log("Test Case 2: Single character patterns");
const text2 = "aaaabbbb";
const patterns2 = findMostFrequentPatterns(text2, 1);
console.log(patterns2); // Expected: [{ pattern: 'a', count: 4 }, { pattern: 'b', count: 4 }]

console.log("Test Case 3: Edge case with empty string");
const text3 = "";
const patterns3 = findMostFrequentPatterns(text3, 2);
console.log(patterns3); // Expected: []

console.log("Test Case 4: Edge case with pattern length larger than text length");
const text4 = "abc";
const patterns4 = findMostFrequentPatterns(text4, 5);
console.log(patterns4); // Expected: []

console.log("Test Case 5: Complex patterns");
const text5 = "xyxyxyxyzzzzzz";
const patterns5 = findMostFrequentPatterns(text5, 3);
console.log(patterns5); // Expected: [{ pattern: 'xyx', count: 4 }, { pattern: 'yxy', count: 3 }, { pattern: 'zzz', count: 3 }, ...]

console.log("Test Case 6: Invalid inputs");
try {
    findMostFrequentPatterns(123, 2);
} catch (e) {
    console.log(e.message); // Expected: Error message
}

try {
    findMostFrequentPatterns("test", -1);
} catch (e) {
    console.log(e.message); // Expected: Error message
}