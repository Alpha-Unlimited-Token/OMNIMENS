/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-04-01T18:18:31.511Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function: Extract unique words from a text, count their occurrences, and sort by frequency
function analyzeTextFrequency(text) {
    if (typeof text !== 'string') {
        throw new TypeError('Input must be a string');
    }

    // Normalize text: remove punctuation, convert to lowercase, and split into words
    const words = text
        .replace(/[^\w\s]|_/g, '')
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

    // Count word occurrences
    const wordCount = {};
    for (const word of words) {
        wordCount[word] = (wordCount[word] || 0) + 1;
    }

    // Convert to array and sort by frequency (descending) and then alphabetically
    const sortedWords = Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

    // Return the sorted array of words with their frequencies
    return sortedWords;
}

// Test cases
console.log('--- Test Cases ---');

// Test 1: Basic functionality
const text1 = "The quick brown fox jumps over the lazy dog. The fox is quick.";
const result1 = analyzeTextFrequency(text1);
console.log(result1);
console.assert(
    JSON.stringify(result1) === JSON.stringify([
        ['the', 3], ['quick', 2], ['fox', 2], ['brown', 1], ['jumps', 1], ['over', 1], ['lazy', 1], ['dog', 1], ['is', 1]
    ]),
    'Test 1 failed'
);

// Test 2: Empty string
const text2 = "";
const result2 = analyzeTextFrequency(text2);
console.log(result2);
console.assert(
    JSON.stringify(result2) === JSON.stringify([]),
    'Test 2 failed'
);

// Test 3: Case insensitivity and punctuation handling
const text3 = "Hello, hello! HELLO? World... world.";
const result3 = analyzeTextFrequency(text3);
console.log(result3);
console.assert(
    JSON.stringify(result3) === JSON.stringify([['hello', 3], ['world', 2]]),
    'Test 3 failed'
);

// Test 4: Numbers and special characters
const text4 = "123 123! #hashtag #hashtag.";
const result4 = analyzeTextFrequency(text4);
console.log(result4);
console.assert(
    JSON.stringify(result4) === JSON.stringify([['123', 2], ['hashtag', 2]]),
    'Test 4 failed'
);

// Test 5: Non-string input
try {
    analyzeTextFrequency(12345);
    console.assert(false, 'Test 5 failed: Did not throw error for non-string input');
} catch (e) {
    console.assert(e instanceof TypeError, 'Test 5 failed: Incorrect error type');
}

console.log('All tests completed.');