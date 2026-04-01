/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-04-01T17:41:12.317Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function for text analysis: Word Frequency Counter
function wordFrequencyCounter(text) {
    if (typeof text !== 'string') {
        throw new TypeError('Input must be a string');
    }

    const words = text.toLowerCase().match(/\b[a-z]+\b/g);
    if (!words) return {};

    const frequency = {};
    for (let word of words) {
        frequency[word] = (frequency[word] || 0) + 1;
    }
    return frequency;
}

// Test cases
console.log("Test Cases for wordFrequencyCounter:");

// Basic test
const text1 = "This is a test. This test is only a test.";
const result1 = wordFrequencyCounter(text1);
console.log(result1);
console.assert(result1['this'] === 2, 'Test case 1 failed');
console.assert(result1['is'] === 2, 'Test case 1 failed');
console.assert(result1['a'] === 2, 'Test case 1 failed');
console.assert(result1['test'] === 3, 'Test case 1 failed');

// Edge case: empty string
const text2 = "";
const result2 = wordFrequencyCounter(text2);
console.log(result2);
console.assert(Object.keys(result2).length === 0, 'Test case 2 failed');

// Edge case: string with no valid words
const text3 = "12345 !!! ???";
const result3 = wordFrequencyCounter(text3);
console.log(result3);
console.assert(Object.keys(result3).length === 0, 'Test case 3 failed');

// Case insensitivity test
const text4 = "Hello hello HELLO";
const result4 = wordFrequencyCounter(text4);
console.log(result4);
console.assert(result4['hello'] === 3, 'Test case 4 failed');

// Large input test
const text5 = "AI is transforming industries. AI is everywhere.";
const result5 = wordFrequencyCounter(text5);
console.log(result5);
console.assert(result5['ai'] === 2, 'Test case 5 failed');
console.assert(result5['is'] === 2, 'Test case 5 failed');
console.assert(result5['transforming'] === 1, 'Test case 5 failed');
console.assert(result5['industries'] === 1, 'Test case 5 failed');
console.assert(result5['everywhere'] === 1, 'Test case 5 failed');

console.log("All test cases passed.");