/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-22T05:38:48.933Z
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
        throw new Error('Invalid input: text must be a string and patternLength must be a positive number.');
    }

    const patternFrequency = new Map();

    // Iterate through the text to extract all patterns of the given length
    for (let i = 0; i <= text.length - patternLength; i++) {
        const pattern = text.substring(i, i + patternLength);
        patternFrequency.set(pattern, (patternFrequency.get(pattern) || 0) + 1);
    }

    // Find the maximum frequency
    let maxFrequency = 0;
    for (const frequency of patternFrequency.values()) {
        if (frequency > maxFrequency) {
            maxFrequency = frequency;
        }
    }

    // Collect all patterns with the maximum frequency
    const mostFrequentPatterns = [];
    for (const [pattern, frequency] of patternFrequency.entries()) {
        if (frequency === maxFrequency) {
            mostFrequentPatterns.push({ pattern, frequency });
        }
    }

    return mostFrequentPatterns;
}

// Self-tests
console.log("Test 1:");
console.log(findMostFrequentPatterns("abababab", 2)); // Expect patterns "ab" and "ba" with frequency 3

console.log("Test 2:");
console.log(findMostFrequentPatterns("abcabcabc", 3)); // Expect pattern "abc" with frequency 3

console.log("Test 3:");
console.log(findMostFrequentPatterns("aaaaa", 2)); // Expect pattern "aa" with frequency 4

console.log("Test 4:");
console.log(findMostFrequentPatterns("abcdef", 2)); // Expect all unique patterns with frequency 1

console.log("Test 5 (Edge Case):");
console.log(findMostFrequentPatterns("a", 1)); // Expect pattern "a" with frequency 1

console.log("Test 6 (Edge Case):");
console.log(findMostFrequentPatterns("", 1)); // Expect an empty array as there are no patterns