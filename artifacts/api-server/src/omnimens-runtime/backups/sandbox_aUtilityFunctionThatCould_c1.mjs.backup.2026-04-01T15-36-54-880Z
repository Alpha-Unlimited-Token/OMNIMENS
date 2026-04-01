/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-04-01T15:12:59.933Z
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

    const words = text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove punctuation
        .split(/\s+/) // Split by whitespace
        .filter(word => word.length > 0); // Filter out empty strings

    const frequencyMap = {};
    for (const word of words) {
        frequencyMap[word] = (frequencyMap[word] || 0) + 1;
    }

    return frequencyMap;
}

// Test cases
console.log('Test Cases:');

// Basic test
const text1 = "This is a test. This test is only a test.";
const result1 = wordFrequencyCounter(text1);
console.assert(result1['this'] === 2, 'Test Case 1 Failed');
console.assert(result1['is'] === 2, 'Test Case 1 Failed');
console.assert(result1['a'] === 2, 'Test Case 1 Failed');
console.assert(result1['test'] === 3, 'Test Case 1 Failed');
console.log('Test Case 1 Passed:', result1);

// Edge case: empty string
const text2 = "";
const result2 = wordFrequencyCounter(text2);
console.assert(Object.keys(result2).length === 0, 'Test Case 2 Failed');
console.log('Test Case 2 Passed:', result2);

// Edge case: string with only punctuation
const text3 = "!!!,,,???";
const result3 = wordFrequencyCounter(text3);
console.assert(Object.keys(result3).length === 0, 'Test Case 3 Failed');
console.log('Test Case 3 Passed:', result3);

// Case insensitivity test
const text4 = "Hello hello HELLO";
const result4 = wordFrequencyCounter(text4);
console.assert(result4['hello'] === 3, 'Test Case 4 Failed');
console.log('Test Case 4 Passed:', result4);

// Complex sentence
const text5 = "AI is the future. AI will change the world!";
const result5 = wordFrequencyCounter(text5);
console.assert(result5['ai'] === 2, 'Test Case 5 Failed');
console.assert(result5['is'] === 1, 'Test Case 5 Failed');
console.assert(result5['the'] === 2, 'Test Case 5 Failed');
console.assert(result5['future'] === 1, 'Test Case 5 Failed');
console.assert(result5['will'] === 1, 'Test Case 5 Failed');
console.assert(result5['change'] === 1, 'Test Case 5 Failed');
console.assert(result5['world'] === 1, 'Test Case 5 Failed');
console.log('Test Case 5 Passed:', result5);