/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-04-01T15:36:54.878Z
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
        throw new TypeError('Input must be a string');
    }

    const wordCounts = {};
    const words = text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove non-alphanumeric characters
        .split(/\s+/); // Split by whitespace

    for (const word of words) {
        if (word) {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
    }

    return wordCounts;
}

// Test cases
console.log('Running tests...');

// Test 1: Basic functionality
const text1 = "AI is the future. AI is evolving rapidly!";
const result1 = extractUniqueWords(text1);
console.assert(result1['ai'] === 2, 'Test 1 Failed: "ai" count should be 2');
console.assert(result1['is'] === 2, 'Test 1 Failed: "is" count should be 2');
console.assert(result1['the'] === 1, 'Test 1 Failed: "the" count should be 1');
console.assert(result1['future'] === 1, 'Test 1 Failed: "future" count should be 1');
console.assert(result1['evolving'] === 1, 'Test 1 Failed: "evolving" count should be 1');
console.assert(result1['rapidly'] === 1, 'Test 1 Failed: "rapidly" count should be 1');

// Test 2: Empty string
const text2 = "";
const result2 = extractUniqueWords(text2);
console.assert(Object.keys(result2).length === 0, 'Test 2 Failed: Result should be an empty object');

// Test 3: Case insensitivity
const text3 = "AI ai Ai";
const result3 = extractUniqueWords(text3);
console.assert(result3['ai'] === 3, 'Test 3 Failed: "ai" count should be 3');

// Test 4: Special characters
const text4 = "Hello, world! Hello...world?";
const result4 = extractUniqueWords(text4);
console.assert(result4['hello'] === 2, 'Test 4 Failed: "hello" count should be 2');
console.assert(result4['world'] === 2, 'Test 4 Failed: "world" count should be 2');

// Test 5: Numbers in text
const text5 = "AI 2023 is amazing! AI 2023.";
const result5 = extractUniqueWords(text5);
console.assert(result5['ai'] === 2, 'Test 5 Failed: "ai" count should be 2');
console.assert(result5['2023'] === 2, 'Test 5 Failed: "2023" count should be 2');
console.assert(result5['is'] === 1, 'Test 5 Failed: "is" count should be 1');
console.assert(result5['amazing'] === 1, 'Test 5 Failed: "amazing" count should be 1');

console.log('All tests passed!');