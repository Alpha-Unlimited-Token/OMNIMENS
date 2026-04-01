/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-04-01T14:51:38.760Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function: Text Frequency Analyzer
// This function analyzes a given text and returns the frequency of each word, sorted by frequency in descending order.

function textFrequencyAnalyzer(text) {
    if (typeof text !== 'string') {
        throw new TypeError('Input must be a string');
    }

    const words = text.toLowerCase().match(/\b[a-z]+\b/g);
    if (!words) return {};

    const frequencyMap = {};
    for (let word of words) {
        frequencyMap[word] = (frequencyMap[word] || 0) + 1;
    }

    const sortedFrequencies = Object.entries(frequencyMap)
        .sort((a, b) => b[1] - a[1])
        .reduce((acc, [word, count]) => {
            acc[word] = count;
            return acc;
        }, {});

    return sortedFrequencies;
}

// Test cases
console.log('Test Case 1: Basic text analysis');
const testText1 = "This is a test. This test is only a test.";
const result1 = textFrequencyAnalyzer(testText1);
console.log(result1);
console.assert(result1['test'] === 3, 'Test Case 1 Failed: "test" frequency');
console.assert(result1['this'] === 2, 'Test Case 1 Failed: "this" frequency');
console.assert(result1['is'] === 2, 'Test Case 1 Failed: "is" frequency');
console.assert(result1['a'] === 2, 'Test Case 1 Failed: "a" frequency');
console.assert(result1['only'] === 1, 'Test Case 1 Failed: "only" frequency');

console.log('Test Case 2: Empty string');
const testText2 = "";
const result2 = textFrequencyAnalyzer(testText2);
console.log(result2);
console.assert(Object.keys(result2).length === 0, 'Test Case 2 Failed: Empty string should return empty object');

console.log('Test Case 3: Non-alphabetic characters');
const testText3 = "123 456! @#$%^&*()";
const result3 = textFrequencyAnalyzer(testText3);
console.log(result3);
console.assert(Object.keys(result3).length === 0, 'Test Case 3 Failed: Non-alphabetic characters should return empty object');

console.log('Test Case 4: Mixed case sensitivity');
const testText4 = "Hello hello HELLO";
const result4 = textFrequencyAnalyzer(testText4);
console.log(result4);
console.assert(result4['hello'] === 3, 'Test Case 4 Failed: Case insensitivity check');

console.log('Test Case 5: Large input');
const testText5 = "word ".repeat(1000) + "test ".repeat(500) + "example ".repeat(200);
const result5 = textFrequencyAnalyzer(testText5);
console.log(result5);
console.assert(result5['word'] === 1000, 'Test Case 5 Failed: "word" frequency');
console.assert(result5['test'] === 500, 'Test Case 5 Failed: "test" frequency');
console.assert(result5['example'] === 200, 'Test Case 5 Failed: "example" frequency');