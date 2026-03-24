/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-24T23:09:02.366Z
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
        const pattern = text.substring(i, i + patternLength);
        patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
    }

    const sortedPatterns = Object.entries(patternCounts).sort((a, b) => b[1] - a[1]);

    return sortedPatterns;
}

// Self-tests
console.log("Test 1: Basic pattern matching");
const text1 = "abcabcabc";
const patternLength1 = 3;
console.log(findMostFrequentPatterns(text1, patternLength1)); // Expected: [["abc", 3]]

console.log("Test 2: Overlapping patterns");
const text2 = "abababab";
const patternLength2 = 2;
console.log(findMostFrequentPatterns(text2, patternLength2)); // Expected: [["ab", 4], ["ba", 3]]

console.log("Test 3: Single character patterns");
const text3 = "aaaaa";
const patternLength3 = 1;
console.log(findMostFrequentPatterns(text3, patternLength3)); // Expected: [["a", 5]]

console.log("Test 4: Edge case - Empty text");
const text4 = "";
const patternLength4 = 2;
console.log(findMostFrequentPatterns(text4, patternLength4)); // Expected: []

console.log("Test 5: Edge case - Pattern length larger than text");
const text5 = "short";
const patternLength5 = 10;
console.log(findMostFrequentPatterns(text5, patternLength5)); // Expected: []

console.log("Test 6: Edge case - Non-overlapping patterns");
const text6 = "abcdef";
const patternLength6 = 2;
console.log(findMostFrequentPatterns(text6, patternLength6)); // Expected: [["ab", 1], ["bc", 1], ["cd", 1], ["de", 1], ["ef", 1]];