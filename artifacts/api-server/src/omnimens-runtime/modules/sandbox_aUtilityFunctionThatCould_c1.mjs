/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-04-01T17:00:52.237Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility Function: Text Pattern Frequency Counter
// This function calculates the frequency of specific patterns (substrings) in a given text.

function countPatternFrequency(text, patterns) {
    if (typeof text !== 'string' || !Array.isArray(patterns)) {
        throw new TypeError('Invalid input: text must be a string and patterns must be an array of strings.');
    }

    const frequencies = {};
    patterns.forEach(pattern => {
        if (typeof pattern !== 'string') {
            throw new TypeError('Invalid pattern: all patterns must be strings.');
        }
        const regex = new RegExp(pattern, 'g');
        const matches = text.match(regex);
        frequencies[pattern] = matches ? matches.length : 0;
    });

    return frequencies;
}

// Test cases
try {
    const text = "The quick brown fox jumps over the lazy dog. The fox is quick and clever.";
    const patterns = ["quick", "fox", "dog", "cat", "The"];

    const result = countPatternFrequency(text, patterns);
    console.log(result); // Expected: { quick: 2, fox: 2, dog: 1, cat: 0, The: 2 }

    // Edge case: Empty text
    console.assert(
        JSON.stringify(countPatternFrequency("", ["a", "b"])) === JSON.stringify({ a: 0, b: 0 }),
        "Failed test case for empty text"
    );

    // Edge case: Empty patterns
    console.assert(
        JSON.stringify(countPatternFrequency("test", [])) === JSON.stringify({}),
        "Failed test case for empty patterns"
    );

    // Edge case: Patterns not found
    console.assert(
        JSON.stringify(countPatternFrequency("hello world", ["xyz"])) === JSON.stringify({ xyz: 0 }),
        "Failed test case for patterns not found"
    );

    // Edge case: Invalid input
    try {
        countPatternFrequency(123, ["test"]);
        console.error("Failed to throw error for invalid text input");
    } catch (e) {
        console.log("Caught expected error for invalid text input:", e.message);
    }

    try {
        countPatternFrequency("test", "not an array");
        console.error("Failed to throw error for invalid patterns input");
    } catch (e) {
        console.log("Caught expected error for invalid patterns input:", e.message);
    }

    console.log("All test cases passed!");
} catch (e) {
    console.error("Error during execution:", e.message);
}