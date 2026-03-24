/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-24T03:54:30.637Z
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

    const patternCounts = new Map();

    for (let i = 0; i <= text.length - patternLength; i++) {
        const pattern = text.substring(i, i + patternLength);
        patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
    }

    const sortedPatterns = Array.from(patternCounts.entries())
        .sort((a, b) => b[1] - a[1]);

    return sortedPatterns;
}

// Self-tests
console.log("Test Case 1:");
console.log(findMostFrequentPatterns("abababab", 2)); // Expected: [["ab", 4], ["ba", 3]]

console.log("Test Case 2:");
console.log(findMostFrequentPatterns("abcabcabc", 3)); // Expected: [["abc", 3]]

console.log("Test Case 3:");
console.log(findMostFrequentPatterns("aaaaaa", 1)); // Expected: [["a", 6]]

console.log("Test Case 4:");
console.log(findMostFrequentPatterns("xyzxyzxyzxyz", 4)); // Expected: [["xyzx", 3], ["yzxy", 3], ["zxyz", 3]]

console.log("Test Case 5:");
console.log(findMostFrequentPatterns("123123123", 3)); // Expected: [["123", 3]]

console.log("Edge Case 1:");
console.log(findMostFrequentPatterns("", 2)); // Expected: []

console.log("Edge Case 2:");
console.log(findMostFrequentPatterns("a", 2)); // Expected: []

console.log("Edge Case 3:");
try {
    console.log(findMostFrequentPatterns(12345, 2)); // Expected: Error
} catch (e) {
    console.log(e.message);
}

console.log("Edge Case 4:");
try {
    console.log(findMostFrequentPatterns("abc", -1)); // Expected: Error
} catch (e) {
    console.log(e.message);
}