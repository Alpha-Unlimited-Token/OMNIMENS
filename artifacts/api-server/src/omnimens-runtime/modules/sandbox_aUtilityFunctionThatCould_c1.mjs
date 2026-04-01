/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-04-01T17:28:37.711Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function: Token Frequency Counter
// This function takes a string of text and returns the frequency of each word/token in the text.

function tokenFrequencyCounter(text) {
    if (typeof text !== 'string') {
        throw new TypeError("Input must be a string");
    }

    // Normalize text: remove punctuation, convert to lowercase, and split into words
    const words = text
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .toLowerCase()          // Convert to lowercase
        .split(/\s+/);          // Split by whitespace

    const frequencyMap = {};

    for (let word of words) {
        if (word) { // Ignore empty strings
            frequencyMap[word] = (frequencyMap[word] || 0) + 1;
        }
    }

    return frequencyMap;
}

// Test cases
console.log("Running tests...");

// Test 1: Basic functionality
const test1 = "This is a test. This test is only a test.";
const result1 = tokenFrequencyCounter(test1);
console.assert(result1['this'] === 2, "Test 1 failed: 'this' should appear 2 times");
console.assert(result1['test'] === 3, "Test 1 failed: 'test' should appear 3 times");
console.assert(result1['is'] === 2, "Test 1 failed: 'is' should appear 2 times");
console.assert(result1['only'] === 1, "Test 1 failed: 'only' should appear 1 time");

// Test 2: Empty string
const test2 = "";
const result2 = tokenFrequencyCounter(test2);
console.assert(Object.keys(result2).length === 0, "Test 2 failed: empty string should return an empty object");

// Test 3: Case insensitivity
const test3 = "Hello hello HELLO";
const result3 = tokenFrequencyCounter(test3);
console.assert(result3['hello'] === 3, "Test 3 failed: 'hello' should appear 3 times");

// Test 4: Punctuation handling
const test4 = "Hi! How are you? I'm fine, thanks.";
const result4 = tokenFrequencyCounter(test4);
console.assert(result4['hi'] === 1, "Test 4 failed: 'hi' should appear 1 time");
console.assert(result4['how'] === 1, "Test 4 failed: 'how' should appear 1 time");
console.assert(result4['are'] === 1, "Test 4 failed: 'are' should appear 1 time");
console.assert(result4['you'] === 1, "Test 4 failed: 'you' should appear 1 time");
console.assert(result4['im'] === 1, "Test 4 failed: 'im' should appear 1 time");
console.assert(result4['fine'] === 1, "Test 4 failed: 'fine' should appear 1 time");
console.assert(result4['thanks'] === 1, "Test 4 failed: 'thanks' should appear 1 time");

console.log("All tests passed!");