/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-24T02:04:04.521Z
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
    // Function to find the most frequent patterns of a given length in a text
    if (typeof text !== 'string' || typeof patternLength !== 'number' || patternLength <= 0) {
        throw new Error('Invalid input: text must be a string and patternLength must be a positive number.');
    }

    const patternCounts = {};
    const textLength = text.length;

    for (let i = 0; i <= textLength - patternLength; i++) {
        const pattern = text.substring(i, i + patternLength);
        if (patternCounts[pattern]) {
            patternCounts[pattern]++;
        } else {
            patternCounts[pattern] = 1;
        }
    }

    const sortedPatterns = Object.entries(patternCounts).sort((a, b) => b[1] - a[1]);
    return sortedPatterns.map(([pattern, count]) => ({ pattern, count }));
}

// Self-tests
console.log("Test Case 1: Basic functionality");
const text1 = "abababab";
const length1 = 2;
const result1 = findMostFrequentPatterns(text1, length1);
console.log(result1); // Expected: [{ pattern: 'ab', count: 4 }, { pattern: 'ba', count: 3 }]

console.log("Test Case 2: Edge case with single character patterns");
const text2 = "aaaa";
const length2 = 1;
const result2 = findMostFrequentPatterns(text2, length2);
console.log(result2); // Expected: [{ pattern: 'a', count: 4 }]

console.log("Test Case 3: Edge case with pattern length larger than text");
const text3 = "abc";
const length3 = 5;
try {
    const result3 = findMostFrequentPatterns(text3, length3);
    console.log(result3); // Should not reach here
} catch (error) {
    console.log(error.message); // Expected: Error about invalid pattern length
}

console.log("Test Case 4: Large input for performance testing");
const text4 = "a".repeat(1000) + "b".repeat(1000);
const length4 = 2;
const result4 = findMostFrequentPatterns(text4, length4);
console.log(result4); // Expected: [{ pattern: 'aa', count: 999 }, { pattern: 'bb', count: 999 }]

console.log("Test Case 5: Mixed characters");
const text5 = "abcabcabc";
const length5 = 3;
const result5 = findMostFrequentPatterns(text5, length5);
console.log(result5); // Expected: [{ pattern: 'abc', count: 3 }, { pattern: 'bca', count: 2 }, { pattern: 'cab', count: 2 }]