/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-21T02:03:41.969Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function: Extracts and counts unique words from a text, ignoring case and punctuation
function extractUniqueWords(text) {
    if (typeof text !== 'string') throw new Error("Input must be a string");

    // Remove punctuation and normalize to lowercase
    const cleanedText = text.replace(/[^\w\s]/g, '').toLowerCase();

    // Split text into words and filter out empty strings
    const words = cleanedText.split(/\s+/).filter(word => word.length > 0);

    // Count occurrences of each unique word
    const wordCounts = {};
    for (let word of words) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
    }

    return wordCounts;
}

// Self-tests
(function testExtractUniqueWords() {
    console.log("Test 1: Basic sentence");
    const result1 = extractUniqueWords("Hello world! Hello again, world.");
    console.log(result1); // Expected: { hello: 2, world: 2, again: 1 }

    console.log("Test 2: Empty string");
    const result2 = extractUniqueWords("");
    console.log(result2); // Expected: {}

    console.log("Test 3: Case insensitivity");
    const result3 = extractUniqueWords("Case CASE case.");
    console.log(result3); // Expected: { case: 3 }

    console.log("Test 4: Numbers and mixed content");
    const result4 = extractUniqueWords("123 apples, 123 oranges, APPLES!");
    console.log(result4); // Expected: { '123': 2, apples: 2, oranges: 1 }

    console.log("Test 5: Special characters");
    const result5 = extractUniqueWords("!@#$%^&*()_+=-`~[]{}|;:'\",.<>?/\\");
    console.log(result5); // Expected: {}

    console.log("Test 6: Long text");
    const result6 = extractUniqueWords("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum.");
    console.log(result6); // Expected: { lorem: 2, ipsum: 2, dolor: 1, sit: 1, amet: 1, consectetur: 1, adipiscing: 1, elit: 1 }
})();