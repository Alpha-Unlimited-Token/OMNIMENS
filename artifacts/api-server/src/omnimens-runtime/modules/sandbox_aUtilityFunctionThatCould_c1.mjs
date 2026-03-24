/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-24T04:35:43.127Z
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
        throw new Error("Invalid input: text must be a string and patternLength must be a positive number.");
    }

    const patternCounts = {};
    const textLength = text.length;

    for (let i = 0; i <= textLength - patternLength; i++) {
        const pattern = text.slice(i, i + patternLength);
        patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
    }

    const sortedPatterns = Object.entries(patternCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([pattern, count]) => ({ pattern, count }));

    return sortedPatterns;
}

// Test cases
function runTests() {
    console.log("Test Case 1: Basic functionality");
    const text1 = "abababab";
    const patterns1 = findMostFrequentPatterns(text1, 2);
    console.log(patterns1); // Expected: [{ pattern: 'ab', count: 4 }, { pattern: 'ba', count: 3 }]

    console.log("Test Case 2: Single character patterns");
    const text2 = "aaaaa";
    const patterns2 = findMostFrequentPatterns(text2, 1);
    console.log(patterns2); // Expected: [{ pattern: 'a', count: 5 }]

    console.log("Test Case 3: Edge case with empty text");
    const text3 = "";
    const patterns3 = findMostFrequentPatterns(text3, 2);
    console.log(patterns3); // Expected: []

    console.log("Test Case 4: Edge case with patternLength larger than text length");
    const text4 = "abc";
    const patterns4 = findMostFrequentPatterns(text4, 5);
    console.log(patterns4); // Expected: []

    console.log("Test Case 5: Pattern length equals text length");
    const text5 = "hello";
    const patterns5 = findMostFrequentPatterns(text5, 5);
    console.log(patterns5); // Expected: [{ pattern: 'hello', count: 1 }]

    console.log("Test Case 6: Complex text with overlapping patterns");
    const text6 = "abcabcabc";
    const patterns6 = findMostFrequentPatterns(text6, 3);
    console.log(patterns6); // Expected: [{ pattern: 'abc', count: 3 }, { pattern: 'bca', count: 2 }, { pattern: 'cab', count: 2 }]
}

runTests();