/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-21T06:29:44.309Z
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

    const patternCounts = {};
    const totalLength = text.length;

    for (let i = 0; i <= totalLength - patternLength; i++) {
        const pattern = text.substring(i, i + patternLength);
        if (patternCounts[pattern]) {
            patternCounts[pattern]++;
        } else {
            patternCounts[pattern] = 1;
        }
    }

    const sortedPatterns = Object.entries(patternCounts).sort((a, b) => b[1] - a[1]);
    return sortedPatterns;
}

// Test cases
function runTests() {
    console.log("Test 1: Basic functionality");
    const text1 = "abababab";
    const patternLength1 = 2;
    console.log(findMostFrequentPatterns(text1, patternLength1)); // Expected: [["ab", 4], ["ba", 3]]

    console.log("Test 2: Single character patterns");
    const text2 = "aaaaa";
    const patternLength2 = 1;
    console.log(findMostFrequentPatterns(text2, patternLength2)); // Expected: [["a", 5]]

    console.log("Test 3: Mixed characters");
    const text3 = "abcabcabc";
    const patternLength3 = 3;
    console.log(findMostFrequentPatterns(text3, patternLength3)); // Expected: [["abc", 3]]

    console.log("Test 4: Edge case - Empty string");
    const text4 = "";
    const patternLength4 = 2;
    console.log(findMostFrequentPatterns(text4, patternLength4)); // Expected: []

    console.log("Test 5: Edge case - Pattern length larger than text");
    const text5 = "abc";
    const patternLength5 = 5;
    console.log(findMostFrequentPatterns(text5, patternLength5)); // Expected: []

    console.log("Test 6: Edge case - Non-overlapping patterns");
    const text6 = "abcdef";
    const patternLength6 = 2;
    console.log(findMostFrequentPatterns(text6, patternLength6)); // Expected: [["ab", 1], ["bc", 1], ["cd", 1], ["de", 1], ["ef", 1]]
}

runTests();