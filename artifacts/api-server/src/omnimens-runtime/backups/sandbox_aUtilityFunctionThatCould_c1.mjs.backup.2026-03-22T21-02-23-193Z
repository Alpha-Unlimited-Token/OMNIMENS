/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-22T20:06:40.249Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function to find the most frequent patterns in a given text
function findMostFrequentPatterns(text, patternLength) {
    if (typeof text !== 'string' || typeof patternLength !== 'number' || patternLength <= 0) {
        throw new Error("Invalid input: text must be a string and patternLength must be a positive number.");
    }

    const patternCounts = new Map();

    for (let i = 0; i <= text.length - patternLength; i++) {
        const pattern = text.substring(i, i + patternLength);
        patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
    }

    let maxFrequency = 0;
    const mostFrequentPatterns = [];

    patternCounts.forEach((count, pattern) => {
        if (count > maxFrequency) {
            maxFrequency = count;
            mostFrequentPatterns.length = 0; // Clear the array
            mostFrequentPatterns.push(pattern);
        } else if (count === maxFrequency) {
            mostFrequentPatterns.push(pattern);
        }
    });

    return {
        patterns: mostFrequentPatterns,
        frequency: maxFrequency
    };
}

// Self-tests
function runTests() {
    console.log("Running tests...");

    // Test 1: Basic functionality
    const result1 = findMostFrequentPatterns("ababab", 2);
    console.log(result1); // Expected: { patterns: ['ab'], frequency: 3 }

    // Test 2: Multiple patterns with the same frequency
    const result2 = findMostFrequentPatterns("abcabcabc", 3);
    console.log(result2); // Expected: { patterns: ['abc'], frequency: 3 }

    // Test 3: Single character patterns
    const result3 = findMostFrequentPatterns("aaaabbbb", 1);
    console.log(result3); // Expected: { patterns: ['a', 'b'], frequency: 4 }

    // Test 4: Edge case - pattern length longer than text
    const result4 = findMostFrequentPatterns("short", 10);
    console.log(result4); // Expected: { patterns: [], frequency: 0 }

    // Test 5: Empty text
    const result5 = findMostFrequentPatterns("", 2);
    console.log(result5); // Expected: { patterns: [], frequency: 0 }

    // Test 6: Invalid inputs
    try {
        findMostFrequentPatterns(12345, 2);
    } catch (e) {
        console.log(e.message); // Expected: Error message
    }

    try {
        findMostFrequentPatterns("valid", -1);
    } catch (e) {
        console.log(e.message); // Expected: Error message
    }

    console.log("Tests completed.");
}

runTests();