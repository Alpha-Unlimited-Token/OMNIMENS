/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-22T19:24:11.892Z
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

    const patternCounts = new Map();

    for (let i = 0; i <= text.length - patternLength; i++) {
        const pattern = text.slice(i, i + patternLength);
        patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
    }

    const sortedPatterns = Array.from(patternCounts.entries()).sort((a, b) => b[1] - a[1]);

    return sortedPatterns.slice(0, 5).map(([pattern, count]) => ({ pattern, count }));
}

// Self-tests
function runTests() {
    console.log('Test 1: Basic functionality');
    const text1 = 'abababab';
    const result1 = findMostFrequentPatterns(text1, 2);
    console.log(result1); // Expected: [{ pattern: 'ab', count: 4 }, { pattern: 'ba', count: 3 }]

    console.log('Test 2: Single character patterns');
    const text2 = 'aaaaa';
    const result2 = findMostFrequentPatterns(text2, 1);
    console.log(result2); // Expected: [{ pattern: 'a', count: 5 }]

    console.log('Test 3: Edge case with empty string');
    const text3 = '';
    const result3 = findMostFrequentPatterns(text3, 2);
    console.log(result3); // Expected: []

    console.log('Test 4: Edge case with pattern length larger than text');
    const text4 = 'abc';
    const result4 = findMostFrequentPatterns(text4, 5);
    console.log(result4); // Expected: []

    console.log('Test 5: Complex pattern analysis');
    const text5 = 'abcabcabcabc';
    const result5 = findMostFrequentPatterns(text5, 3);
    console.log(result5); // Expected: [{ pattern: 'abc', count: 4 }]
}

runTests();