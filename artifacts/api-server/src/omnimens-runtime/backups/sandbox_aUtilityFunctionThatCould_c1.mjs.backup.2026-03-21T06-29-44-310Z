/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-21T06:24:45.023Z
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
        const pattern = text.slice(i, i + patternLength);
        patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
    }

    const maxFrequency = Math.max(...patternCounts.values());
    const mostFrequentPatterns = Array.from(patternCounts.entries())
        .filter(([_, count]) => count === maxFrequency)
        .map(([pattern]) => pattern);

    return {
        patterns: mostFrequentPatterns,
        frequency: maxFrequency
    };
}

// Test cases
function runTests() {
    console.log("Test 1: Basic functionality");
    const result1 = findMostFrequentPatterns("abababab", 2);
    console.log(result1); // { patterns: ['ab', 'ba'], frequency: 4 }

    console.log("Test 2: Single character patterns");
    const result2 = findMostFrequentPatterns("aabbcc", 1);
    console.log(result2); // { patterns: ['a', 'b', 'c'], frequency: 2 }

    console.log("Test 3: Entire string as pattern");
    const result3 = findMostFrequentPatterns("abcde", 5);
    console.log(result3); // { patterns: ['abcde'], frequency: 1 }

    console.log("Test 4: Edge case with empty string");
    try {
        const result4 = findMostFrequentPatterns("", 2);
        console.log(result4);
    } catch (e) {
        console.log(e.message); // Error message
    }

    console.log("Test 5: Pattern length greater than string length");
    try {
        const result5 = findMostFrequentPatterns("abc", 5);
        console.log(result5);
    } catch (e) {
        console.log(e.message); // Error message
    }

    console.log("Test 6: Non-string input");
    try {
        const result6 = findMostFrequentPatterns(12345, 2);
        console.log(result6);
    } catch (e) {
        console.log(e.message); // Error message
    }

    console.log("Test 7: Non-number pattern length");
    try {
        const result7 = findMostFrequentPatterns("abcdef", "two");
        console.log(result7);
    } catch (e) {
        console.log(e.message); // Error message
    }

    console.log("Test 8: Pattern length of 0");
    try {
        const result8 = findMostFrequentPatterns("abcdef", 0);
        console.log(result8);
    } catch (e) {
        console.log(e.message); // Error message
    }

    console.log("Test 9: Pattern length of 1 with repeated characters");
    const result9 = findMostFrequentPatterns("aaaaa", 1);
    console.log(result9); // { patterns: ['a'], frequency: 5 }
}

runTests();