/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-21T02:50:57.872Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function: Find the most frequent patterns in a dataset
function findMostFrequentPatterns(data, patternLength) {
    if (!Array.isArray(data) || data.length === 0 || patternLength <= 0) {
        throw new Error("Invalid input: data must be a non-empty array and patternLength must be a positive integer.");
    }

    const patternCounts = new Map();

    // Iterate through the data to extract patterns of the specified length
    for (let i = 0; i <= data.length - patternLength; i++) {
        const pattern = data.slice(i, i + patternLength).join(",");
        patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
    }

    // Find the maximum frequency
    let maxFrequency = 0;
    patternCounts.forEach((count) => {
        if (count > maxFrequency) {
            maxFrequency = count;
        }
    });

    // Collect all patterns with the maximum frequency
    const mostFrequentPatterns = [];
    patternCounts.forEach((count, pattern) => {
        if (count === maxFrequency) {
            mostFrequentPatterns.push({ pattern: pattern.split(","), frequency: count });
        }
    });

    return mostFrequentPatterns;
}

// Test cases
console.log("Test Case 1:");
console.log(
    findMostFrequentPatterns([1, 2, 3, 1, 2, 3, 1, 2, 4], 2)
); // Expect patterns like [1,2] or [2,3] with their frequencies

console.log("Test Case 2:");
console.log(
    findMostFrequentPatterns(["a", "b", "a", "b", "c", "a", "b", "a"], 3)
); // Expect patterns like ["a","b","a"] with their frequencies

console.log("Test Case 3:");
console.log(
    findMostFrequentPatterns([5, 5, 5, 5, 5], 1)
); // Expect pattern [5] with its frequency

console.log("Test Case 4 (Edge Case):");
try {
    console.log(findMostFrequentPatterns([], 2)); // Expect an error
} catch (e) {
    console.log(e.message);
}

console.log("Test Case 5 (Edge Case):");
try {
    console.log(findMostFrequentPatterns([1, 2, 3], 0)); // Expect an error
} catch (e) {
    console.log(e.message);
}