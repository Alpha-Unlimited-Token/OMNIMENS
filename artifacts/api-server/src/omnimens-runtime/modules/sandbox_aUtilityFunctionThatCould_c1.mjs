/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-23T21:03:10.056Z
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
function extractUniqueWords(text) {
    if (typeof text !== 'string') {
        throw new Error("Input must be a string");
    }

    // Normalize text: convert to lowercase and remove non-alphanumeric characters (except spaces)
    const normalizedText = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');

    // Split text into words
    const words = normalizedText.split(/\s+/).filter(word => word.length > 0);

    // Count occurrences of each unique word
    const wordCounts = {};
    for (let word of words) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
    }

    return wordCounts;
}

// Self-tests
(function testExtractUniqueWords() {
    // Test case 1: Basic functionality
    const text1 = "Hello, world! Hello again.";
    const result1 = extractUniqueWords(text1);
    console.log(result1); // Expected: { hello: 2, world: 1, again: 1 }

    // Test case 2: Case insensitivity and punctuation removal
    const text2 = "This is a test. This is only a test!";
    const result2 = extractUniqueWords(text2);
    console.log(result2); // Expected: { this: 2, is: 2, a: 2, test: 2, only: 1 }

    // Test case 3: Empty string
    const text3 = "";
    const result3 = extractUniqueWords(text3);
    console.log(result3); // Expected: {}

    // Test case 4: Numbers and mixed alphanumeric words
    const text4 = "123 abc 123 abc123";
    const result4 = extractUniqueWords(text4);
    console.log(result4); // Expected: { '123': 2, abc: 1, abc123: 1 }

    // Test case 5: Input validation
    try {
        extractUniqueWords(12345); // Should throw an error
    } catch (e) {
        console.log(e.message); // Expected: "Input must be a string"
    }
})();