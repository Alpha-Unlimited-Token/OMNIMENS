/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-21T04:16:55.139Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function: Extract unique words from a text and count their occurrences
function extractUniqueWordsWithCount(text) {
    if (typeof text !== "string") {
        throw new Error("Input must be a string");
    }

    // Normalize text: convert to lowercase and remove non-alphanumeric characters
    const normalizedText = text.toLowerCase().replace(/[^a-z0-9\s]/g, "");

    // Split text into words
    const words = normalizedText.split(/\s+/).filter(word => word.length > 0);

    // Count occurrences of each unique word
    const wordCounts = {};
    for (let word of words) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
    }

    return wordCounts;
}

// Test cases
function runTests() {
    console.log("Test 1: Basic functionality");
    const text1 = "Hello world! Hello again, world.";
    const result1 = extractUniqueWordsWithCount(text1);
    console.log(result1); // Expected: { hello: 2, world: 2, again: 1 }

    console.log("Test 2: Case insensitivity and punctuation removal");
    const text2 = "AI, ai, Ai... AI!";
    const result2 = extractUniqueWordsWithCount(text2);
    console.log(result2); // Expected: { ai: 4 }

    console.log("Test 3: Empty string");
    const text3 = "";
    const result3 = extractUniqueWordsWithCount(text3);
    console.log(result3); // Expected: {}

    console.log("Test 4: String with only spaces");
    const text4 = "     ";
    const result4 = extractUniqueWordsWithCount(text4);
    console.log(result4); // Expected: {}

    console.log("Test 5: Complex string with numbers");
    const text5 = "123 apples, 123 oranges, and 456 bananas.";
    const result5 = extractUniqueWordsWithCount(text5);
    console.log(result5); // Expected: { "123": 2, apples: 1, oranges: 1, and: 1, "456": 1, bananas: 1 }

    console.log("Test 6: Non-string input (should throw error)");
    try {
        extractUniqueWordsWithCount(12345);
    } catch (e) {
        console.log(e.message); // Expected: "Input must be a string"
    }
}

// Run tests
runTests();