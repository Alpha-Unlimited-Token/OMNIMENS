/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-22T18:56:20.719Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function extractUniqueWords(text) {
    // Function to extract unique words from a given text
    const wordPattern = /\b[a-zA-Z]+\b/g;
    const words = text.match(wordPattern) || [];
    const uniqueWords = Array.from(new Set(words.map(word => word.toLowerCase())));
    return uniqueWords.sort();
}

// Test cases
function runTests() {
    console.log("Test 1: Basic extraction");
    const text1 = "Hello world! Hello AI.";
    const result1 = extractUniqueWords(text1);
    console.log(result1); // Expected: ["ai", "hello", "world"]

    console.log("Test 2: Case insensitivity");
    const text2 = "Test case CASE test.";
    const result2 = extractUniqueWords(text2);
    console.log(result2); // Expected: ["case", "test"]

    console.log("Test 3: Empty input");
    const text3 = "";
    const result3 = extractUniqueWords(text3);
    console.log(result3); // Expected: []

    console.log("Test 4: Special characters");
    const text4 = "Numbers 123 and symbols #!@.";
    const result4 = extractUniqueWords(text4);
    console.log(result4); // Expected: ["and", "numbers", "symbols"]

    console.log("Test 5: Large input");
    const text5 = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum.";
    const result5 = extractUniqueWords(text5);
    console.log(result5); // Expected: ["adipiscing", "amet", "consectetur", "dolor", "elit", "ipsum", "lorem", "sit"]
}

// Run tests
runTests();