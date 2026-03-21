/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-21T00:56:00.531Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function findPatternsInText(text, patterns) {
    if (typeof text !== 'string' || !Array.isArray(patterns)) {
        throw new Error("Invalid input: text must be a string and patterns must be an array of strings.");
    }

    const results = {};
    patterns.forEach(pattern => {
        if (typeof pattern !== 'string') {
            throw new Error("Invalid pattern: all patterns must be strings.");
        }
        const regex = new RegExp(pattern, 'g');
        const matches = text.match(regex);
        results[pattern] = matches ? matches : [];
    });

    return results;
}

// Self-tests
function runTests() {
    console.log("Running tests...");

    // Test 1: Basic pattern matching
    const text1 = "The quick brown fox jumps over the lazy dog.";
    const patterns1 = ["quick", "fox", "dog"];
    const result1 = findPatternsInText(text1, patterns1);
    console.log(result1); // Expected: { quick: ['quick'], fox: ['fox'], dog: ['dog'] }

    // Test 2: No matches
    const text2 = "Hello world!";
    const patterns2 = ["cat", "mouse"];
    const result2 = findPatternsInText(text2, patterns2);
    console.log(result2); // Expected: { cat: [], mouse: [] }

    // Test 3: Multiple occurrences
    const text3 = "abababab";
    const patterns3 = ["ab"];
    const result3 = findPatternsInText(text3, patterns3);
    console.log(result3); // Expected: { ab: ['ab', 'ab', 'ab', 'ab'] }

    // Test 4: Edge case with empty text
    const text4 = "";
    const patterns4 = ["anything"];
    const result4 = findPatternsInText(text4, patterns4);
    console.log(result4); // Expected: { anything: [] }

    // Test 5: Edge case with empty patterns
    const text5 = "Some text here.";
    const patterns5 = [];
    const result5 = findPatternsInText(text5, patterns5);
    console.log(result5); // Expected: {}

    console.log("All tests completed.");
}

runTests();