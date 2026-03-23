/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-23T15:14:25.395Z
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

    const sortedPatterns = Array.from(patternCounts.entries()).sort((a, b) => b[1] - a[1]);
    return sortedPatterns;
}

// Self-tests
function runTests() {
    console.log("Running tests...");

    const text1 = "abcabcabc";
    const patterns1 = findMostFrequentPatterns(text1, 3);
    console.log("Test 1:", patterns1); // Expect: [["abc", 3]]

    const text2 = "aaaaa";
    const patterns2 = findMostFrequentPatterns(text2, 2);
    console.log("Test 2:", patterns2); // Expect: [["aa", 4]]

    const text3 = "abcdef";
    const patterns3 = findMostFrequentPatterns(text3, 2);
    console.log("Test 3:", patterns3); // Expect: [["ab", 1], ["bc", 1], ["cd", 1], ["de", 1], ["ef", 1]]

    const text4 = "";
    const patterns4 = findMostFrequentPatterns(text4, 2);
    console.log("Test 4:", patterns4); // Expect: []

    const text5 = "a";
    const patterns5 = findMostFrequentPatterns(text5, 1);
    console.log("Test 5:", patterns5); // Expect: [["a", 1]]

    console.log("All tests completed.");
}

runTests();