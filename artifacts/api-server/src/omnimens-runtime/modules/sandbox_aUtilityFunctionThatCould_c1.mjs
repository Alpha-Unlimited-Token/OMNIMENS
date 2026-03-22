/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-22T04:28:20.098Z
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
    for (let pattern of patterns) {
        if (typeof pattern !== 'string') {
            throw new Error("Invalid pattern: patterns must be an array of strings.");
        }
        const regex = new RegExp(pattern, 'g');
        const matches = text.match(regex);
        results[pattern] = matches ? matches.length : 0;
    }
    return results;
}

// Test cases
function runTests() {
    console.log("Running tests...");

    // Test 1: Basic pattern matching
    const text1 = "The quick brown fox jumps over the lazy dog. The fox is clever.";
    const patterns1 = ["fox", "dog", "The"];
    console.log(findPatternsInText(text1, patterns1)); // Expected: { fox: 2, dog: 1, The: 2 }

    // Test 2: No matches
    const text2 = "Hello world!";
    const patterns2 = ["cat", "tree"];
    console.log(findPatternsInText(text2, patterns2)); // Expected: { cat: 0, tree: 0 }

    // Test 3: Edge case - empty text
    const text3 = "";
    const patterns3 = ["word"];
    console.log(findPatternsInText(text3, patterns3)); // Expected: { word: 0 }

    // Test 4: Edge case - empty patterns
    const text4 = "Sample text.";
    const patterns4 = [];
    console.log(findPatternsInText(text4, patterns4)); // Expected: {}

    // Test 5: Edge case - special characters in patterns
    const text5 = "abc123!@#abc";
    const patterns5 = ["abc", "\\d+", "!"];
    console.log(findPatternsInText(text5, patterns5)); // Expected: { abc: 2, \\d+: 3, !: 1 }

    // Test 6: Invalid inputs
    try {
        console.log(findPatternsInText(123, ["abc"])); // Expected: Error
    } catch (e) {
        console.log(e.message); // Expected error message
    }

    try {
        console.log(findPatternsInText("text", [123])); // Expected: Error
    } catch (e) {
        console.log(e.message); // Expected error message
    }

    console.log("All tests completed.");
}

// Run the tests
runTests();