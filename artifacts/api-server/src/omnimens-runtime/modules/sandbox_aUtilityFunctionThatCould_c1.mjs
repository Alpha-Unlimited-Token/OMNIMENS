/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-21T16:21:53.293Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function: Find the most frequent patterns in a dataset (e.g., text, numbers, or mixed data)
function findMostFrequentPatterns(data, topN) {
    if (!Array.isArray(data)) {
        throw new Error("Input data must be an array.");
    }

    const frequencyMap = new Map();

    // Count occurrences of each element in the data
    for (let item of data) {
        const key = JSON.stringify(item); // Use JSON.stringify to handle complex objects
        frequencyMap.set(key, (frequencyMap.get(key) || 0) + 1);
    }

    // Convert frequency map to an array and sort by frequency (descending)
    const sortedFrequencies = Array.from(frequencyMap.entries()).sort((a, b) => b[1] - a[1]);

    // Extract the top N patterns
    const topPatterns = sortedFrequencies.slice(0, topN).map(([key, frequency]) => ({
        pattern: JSON.parse(key),
        frequency: frequency
    }));

    return topPatterns;
}

// Test cases
console.log("Test Case 1: Simple numeric data");
const numericData = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4];
console.log(findMostFrequentPatterns(numericData, 3));
// Expected output: [{ pattern: 4, frequency: 4 }, { pattern: 3, frequency: 3 }, { pattern: 2, frequency: 2 }]

console.log("Test Case 2: Text data");
const textData = ["apple", "banana", "apple", "orange", "banana", "banana"];
console.log(findMostFrequentPatterns(textData, 2));
// Expected output: [{ pattern: "banana", frequency: 3 }, { pattern: "apple", frequency: 2 }]

console.log("Test Case 3: Mixed data");
const mixedData = [1, "apple", 1, "banana", "apple", { a: 1 }, { a: 1 }, { b: 2 }, { a: 1 }];
console.log(findMostFrequentPatterns(mixedData, 3));
// Expected output: [{ pattern: { a: 1 }, frequency: 3 }, { pattern: 1, frequency: 2 }, { pattern: "apple", frequency: 2 }]

console.log("Test Case 4: Edge case - empty data");
const emptyData = [];
console.log(findMostFrequentPatterns(emptyData, 3));
// Expected output: []

console.log("Test Case 5: Edge case - requesting more patterns than available");
const smallData = [1, 2];
console.log(findMostFrequentPatterns(smallData, 5));
// Expected output: [{ pattern: 1, frequency: 1 }, { pattern: 2, frequency: 1 }]