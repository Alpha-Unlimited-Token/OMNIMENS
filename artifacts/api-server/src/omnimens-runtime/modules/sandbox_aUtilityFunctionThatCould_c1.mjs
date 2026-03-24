/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-24T23:21:07.836Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility Function: Text Pattern Frequency Analyzer
// This function analyzes a given text and identifies the frequency of patterns (words or phrases) of a specified length.

function analyzePatternFrequency(text, patternLength) {
    if (typeof text !== 'string' || typeof patternLength !== 'number' || patternLength <= 0) {
        throw new Error('Invalid input. Text must be a string and patternLength must be a positive number.');
    }

    const words = text.split(/\s+/).filter(word => word.trim().length > 0);
    const patternMap = new Map();

    for (let i = 0; i <= words.length - patternLength; i++) {
        const pattern = words.slice(i, i + patternLength).join(' ');
        patternMap.set(pattern, (patternMap.get(pattern) || 0) + 1);
    }

    const result = Array.from(patternMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([pattern, count]) => ({ pattern, count }));

    return result;
}

// Self-tests
function runTests() {
    console.log("Test 1: Single-word patterns");
    console.log(analyzePatternFrequency("hello world hello universe", 1));
    // Expected output: [{ pattern: 'hello', count: 2 }, { pattern: 'world', count: 1 }, { pattern: 'universe', count: 1 }]

    console.log("Test 2: Two-word patterns");
    console.log(analyzePatternFrequency("hello world hello universe world hello", 2));
    // Expected output: [{ pattern: 'hello world', count: 2 }, { pattern: 'world hello', count: 2 }, { pattern: 'hello universe', count: 1 }, { pattern: 'universe world', count: 1 }]

    console.log("Test 3: Three-word patterns");
    console.log(analyzePatternFrequency("a quick brown fox jumps over the lazy dog", 3));
    // Expected output: [{ pattern: 'a quick brown', count: 1 }, { pattern: 'quick brown fox', count: 1 }, ...]

    console.log("Test 4: Edge case - Empty text");
    console.log(analyzePatternFrequency("", 2));
    // Expected output: []

    console.log("Test 5: Edge case - Pattern length larger than text");
    console.log(analyzePatternFrequency("short text", 5));
    // Expected output: []

    console.log("Test 6: Edge case - Invalid inputs");
    try {
        console.log(analyzePatternFrequency(12345, 2));
    } catch (e) {
        console.log(e.message); // Expected error message
    }

    try {
        console.log(analyzePatternFrequency("valid text", -1));
    } catch (e) {
        console.log(e.message); // Expected error message
    }
}

// Run the tests
runTests();