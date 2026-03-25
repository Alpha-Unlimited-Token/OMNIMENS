/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-25T01:12:28.757Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function: `findMostFrequentPatterns`
// This function analyzes an array of strings and identifies the most frequently occurring patterns (words or phrases) of a given length.
function findMostFrequentPatterns(data, patternLength) {
    if (!Array.isArray(data) || typeof patternLength !== 'number' || patternLength <= 0) {
        throw new Error("Invalid input: data must be an array of strings and patternLength must be a positive number.");
    }

    const patternCounts = new Map();

    // Analyze each string in the array
    for (let str of data) {
        if (typeof str !== 'string') continue;

        const words = str.split(/\s+/); // Split string into words
        for (let i = 0; i <= words.length - patternLength; i++) {
            const pattern = words.slice(i, i + patternLength).join(' ');
            patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
        }
    }

    // Find the maximum frequency
    let maxFrequency = 0;
    for (let count of patternCounts.values()) {
        if (count > maxFrequency) {
            maxFrequency = count;
        }
    }

    // Collect the most frequent patterns
    const mostFrequentPatterns = [];
    for (let [pattern, count] of patternCounts.entries()) {
        if (count === maxFrequency) {
            mostFrequentPatterns.push({ pattern, count });
        }
    }

    return mostFrequentPatterns;
}

// Test cases
function runTests() {
    console.log("Running tests...");

    // Test 1: Basic functionality
    const data1 = [
        "the quick brown fox jumps over the lazy dog",
        "the quick brown fox is quick",
        "quick brown fox quick brown fox"
    ];
    const result1 = findMostFrequentPatterns(data1, 2);
    console.log("Test 1 Result:", result1);

    // Test 2: Single string input
    const data2 = ["hello world hello world hello"];
    const result2 = findMostFrequentPatterns(data2, 2);
    console.log("Test 2 Result:", result2);

    // Test 3: Edge case with no patterns
    const data3 = ["hello"];
    const result3 = findMostFrequentPatterns(data3, 2);
    console.log("Test 3 Result:", result3);

    // Test 4: Empty input
    const data4 = [];
    const result4 = findMostFrequentPatterns(data4, 2);
    console.log("Test 4 Result:", result4);

    // Test 5: Pattern length greater than words in strings
    const data5 = ["short test"];
    const result5 = findMostFrequentPatterns(data5, 3);
    console.log("Test 5 Result:", result5);

    // Test 6: Invalid input
    try {
        findMostFrequentPatterns("not an array", 2);
    } catch (e) {
        console.log("Test 6 Result: Passed (Caught Error)");
    }

    console.log("Tests completed.");
}

runTests();