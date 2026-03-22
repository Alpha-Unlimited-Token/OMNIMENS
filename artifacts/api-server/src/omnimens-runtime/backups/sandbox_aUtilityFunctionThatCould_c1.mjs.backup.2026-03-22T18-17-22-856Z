/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-22T17:29:05.521Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function extractPatternsFromText(text, patterns) {
    if (typeof text !== 'string' || !Array.isArray(patterns)) {
        throw new Error('Invalid input: text must be a string and patterns must be an array of strings.');
    }

    const results = {};
    patterns.forEach(pattern => {
        try {
            const regex = new RegExp(pattern, 'g');
            const matches = text.match(regex);
            results[pattern] = matches || [];
        } catch (e) {
            results[pattern] = `Invalid regex: ${pattern}`;
        }
    });

    return results;
}

// Self-tests
function runTests() {
    console.log("Running Tests...");

    // Test 1: Basic pattern matching
    const text1 = "The quick brown fox jumps over the lazy dog.";
    const patterns1 = ["quick", "fox", "dog"];
    const result1 = extractPatternsFromText(text1, patterns1);
    console.log("Test 1 Result:", result1);

    // Test 2: Regex pattern matching
    const text2 = "abc123 def456 ghi789";
    const patterns2 = ["\\d+", "[a-z]+", "xyz"];
    const result2 = extractPatternsFromText(text2, patterns2);
    console.log("Test 2 Result:", result2);

    // Test 3: Invalid regex
    const text3 = "Sample text.";
    const patterns3 = ["[", "text"];
    const result3 = extractPatternsFromText(text3, patterns3);
    console.log("Test 3 Result:", result3);

    // Test 4: Edge case - empty text
    const text4 = "";
    const patterns4 = ["empty", "\\s"];
    const result4 = extractPatternsFromText(text4, patterns4);
    console.log("Test 4 Result:", result4);

    // Test 5: Edge case - empty patterns
    const text5 = "Non-empty text.";
    const patterns5 = [];
    const result5 = extractPatternsFromText(text5, patterns5);
    console.log("Test 5 Result:", result5);

    // Test 6: Invalid input types
    try {
        extractPatternsFromText(123, ["pattern"]);
    } catch (e) {
        console.log("Test 6 Result:", e.message);
    }

    try {
        extractPatternsFromText("Valid text", "not an array");
    } catch (e) {
        console.log("Test 6 Result:", e.message);
    }
}

// Run self-tests
runTests();