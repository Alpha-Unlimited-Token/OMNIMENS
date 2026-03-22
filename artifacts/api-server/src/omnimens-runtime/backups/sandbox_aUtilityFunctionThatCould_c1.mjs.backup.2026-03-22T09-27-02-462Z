/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-22T09:16:45.621Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function findMostFrequentPatterns(input, patternLength) {
    if (typeof input !== 'string' || typeof patternLength !== 'number' || patternLength <= 0) {
        throw new Error("Invalid input: 'input' must be a string and 'patternLength' must be a positive number.");
    }

    const patternCounts = new Map();

    for (let i = 0; i <= input.length - patternLength; i++) {
        const pattern = input.substring(i, i + patternLength);
        patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
    }

    const maxFrequency = Math.max(...patternCounts.values());
    const mostFrequentPatterns = [];

    patternCounts.forEach((count, pattern) => {
        if (count === maxFrequency) {
            mostFrequentPatterns.push({ pattern, count });
        }
    });

    return mostFrequentPatterns;
}

// Test cases
console.log("Test Case 1: Basic string with repeated patterns");
console.log(findMostFrequentPatterns("ababab", 2)); // Expected: [{ pattern: "ab", count: 3 }]

console.log("Test Case 2: String with multiple patterns of equal frequency");
console.log(findMostFrequentPatterns("abcabcabc", 3)); // Expected: [{ pattern: "abc", count: 3 }]

console.log("Test Case 3: Single character patterns");
console.log(findMostFrequentPatterns("aaaaa", 1)); // Expected: [{ pattern: "a", count: 5 }]

console.log("Test Case 4: Edge case with no patterns (empty string)");
console.log(findMostFrequentPatterns("", 2)); // Expected: []

console.log("Test Case 5: Edge case with pattern length greater than string length");
console.log(findMostFrequentPatterns("abc", 5)); // Expected: []

console.log("Test Case 6: String with overlapping patterns");
console.log(findMostFrequentPatterns("aaaa", 2)); // Expected: [{ pattern: "aa", count: 3 }]

console.log("Test Case 7: Invalid inputs");
try {
    console.log(findMostFrequentPatterns(12345, 2)); // Expected: Error
} catch (e) {
    console.log(e.message);
}

try {
    console.log(findMostFrequentPatterns("abc", -1)); // Expected: Error
} catch (e) {
    console.log(e.message);
}