/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-21T16:12:07.310Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function: Find the most frequent patterns in a text
function findFrequentPatterns(text, patternLength, topN) {
    if (typeof text !== 'string' || typeof patternLength !== 'number' || typeof topN !== 'number') {
        throw new Error('Invalid input types. Expected (string, number, number).');
    }
    if (patternLength <= 0 || topN <= 0) {
        throw new Error('Pattern length and topN must be positive integers.');
    }
    const patternCounts = new Map();

    // Extract all substrings of the given length
    for (let i = 0; i <= text.length - patternLength; i++) {
        const pattern = text.substring(i, i + patternLength);
        patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
    }

    // Convert map to array and sort by frequency
    const sortedPatterns = Array.from(patternCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN);

    // Return the top N patterns and their frequencies
    return sortedPatterns.map(([pattern, count]) => ({ pattern, count }));
}

// Self-tests
function runTests() {
    console.log("Test 1: Basic functionality");
    const text1 = "abcabcabc";
    const result1 = findFrequentPatterns(text1, 3, 2);
    console.log(result1); // Expected: [{ pattern: 'abc', count: 3 }]

    console.log("Test 2: Handling overlapping patterns");
    const text2 = "aaaaaa";
    const result2 = findFrequentPatterns(text2, 2, 2);
    console.log(result2); // Expected: [{ pattern: 'aa', count: 5 }]

    console.log("Test 3: Multiple patterns with same frequency");
    const text3 = "abababab";
    const result3 = findFrequentPatterns(text3, 2, 2);
    console.log(result3); // Expected: [{ pattern: 'ab', count: 4 }, { pattern: 'ba', count: 3 }]

    console.log("Test 4: Edge case - pattern length longer than text");
    const text4 = "short";
    const result4 = findFrequentPatterns(text4, 10, 1);
    console.log(result4); // Expected: []

    console.log("Test 5: Edge case - empty text");
    const text5 = "";
    const result5 = findFrequentPatterns(text5, 2, 1);
    console.log(result5); // Expected: []

    console.log("Test 6: Edge case - single character text");
    const text6 = "a";
    const result6 = findFrequentPatterns(text6, 1, 1);
    console.log(result6); // Expected: [{ pattern: 'a', count: 1 }]
}

// Run tests
runTests();