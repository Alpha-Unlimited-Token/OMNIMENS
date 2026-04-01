/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-04-01T20:33:13.857Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function: `findMostFrequentWords`
// This function takes a string of text and returns the top N most frequent words along with their frequency count.

function findMostFrequentWords(text, topN) {
    if (typeof text !== 'string' || typeof topN !== 'number' || topN <= 0) {
        throw new TypeError('Invalid input: text must be a string and topN must be a positive number.');
    }

    // Normalize the text: remove punctuation, convert to lowercase, and split into words.
    const words = text
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .toLowerCase()
        .split(/\s+/); // Split by whitespace

    // Count word frequencies.
    const frequencyMap = {};
    words.forEach(word => {
        if (word) {
            frequencyMap[word] = (frequencyMap[word] || 0) + 1;
        }
    });

    // Convert the frequency map to an array of [word, frequency] pairs.
    const frequencyArray = Object.entries(frequencyMap);

    // Sort the array by frequency in descending order.
    frequencyArray.sort((a, b) => b[1] - a[1]);

    // Return the top N most frequent words.
    return frequencyArray.slice(0, topN);
}

// Test cases
console.log('Test Cases for findMostFrequentWords:');

// Test 1: Basic functionality
const text1 = "The quick brown fox jumps over the lazy dog. The fox was very quick.";
const result1 = findMostFrequentWords(text1, 3);
console.log(result1);
console.assert(
    JSON.stringify(result1) === JSON.stringify([['the', 3], ['quick', 2], ['fox', 2]]),
    'Test 1 Failed'
);

// Test 2: Edge case with special characters
const text2 = "Hello, hello! HELLO? World... world.";
const result2 = findMostFrequentWords(text2, 2);
console.log(result2);
console.assert(
    JSON.stringify(result2) === JSON.stringify([['hello', 3], ['world', 2]]),
    'Test 2 Failed'
);

// Test 3: Edge case with empty string
const text3 = "";
const result3 = findMostFrequentWords(text3, 3);
console.log(result3);
console.assert(
    JSON.stringify(result3) === JSON.stringify([]),
    'Test 3 Failed'
);

// Test 4: Edge case with topN larger than unique words
const text4 = "apple banana apple";
const result4 = findMostFrequentWords(text4, 5);
console.log(result4);
console.assert(
    JSON.stringify(result4) === JSON.stringify([['apple', 2], ['banana', 1]]),
    'Test 4 Failed'
);

// Test 5: Invalid inputs
let errorCaught = false;
try {
    findMostFrequentWords(12345, 3);
} catch (e) {
    errorCaught = true;
    console.log('Test 5 Passed: Caught error for invalid text input.');
}
console.assert(errorCaught, 'Test 5 Failed');

// Test 6: Invalid topN input
errorCaught = false;
try {
    findMostFrequentWords("Valid text", -1);
} catch (e) {
    errorCaught = true;
    console.log('Test 6 Passed: Caught error for invalid topN input.');
}
console.assert(errorCaught, 'Test 6 Failed');