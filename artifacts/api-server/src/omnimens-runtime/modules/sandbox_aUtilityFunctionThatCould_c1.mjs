/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-24T12:21:07.480Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function findMostFrequentWords(text, topN) {
    if (typeof text !== 'string' || typeof topN !== 'number' || topN <= 0) {
        throw new Error('Invalid input: text must be a string and topN must be a positive number.');
    }

    const wordCounts = {};
    const words = text.toLowerCase().match(/\b[a-z]+\b/g);

    if (!words) {
        return [];
    }

    for (let word of words) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
    }

    const sortedWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);
    return sortedWords.slice(0, topN).map(([word, count]) => ({ word, count }));
}

// Self-tests
console.log('Test 1: Basic functionality');
const text1 = "This is a test. This test is only a test.";
console.log(findMostFrequentWords(text1, 2)); // Expected: [{ word: 'test', count: 3 }, { word: 'this', count: 2 }]

console.log('Test 2: Edge case - empty string');
const text2 = "";
console.log(findMostFrequentWords(text2, 5)); // Expected: []

console.log('Test 3: Edge case - no valid words');
const text3 = "12345 !!! ###";
console.log(findMostFrequentWords(text3, 3)); // Expected: []

console.log('Test 4: Large input');
const text4 = "apple banana apple orange banana apple orange orange orange";
console.log(findMostFrequentWords(text4, 3)); // Expected: [{ word: 'orange', count: 4 }, { word: 'apple', count: 3 }, { word: 'banana', count: 2 }]

console.log('Test 5: Invalid input');
try {
    console.log(findMostFrequentWords(12345, 3)); // Expected: Error
} catch (e) {
    console.log(e.message); // Expected error message
}

try {
    console.log(findMostFrequentWords("Valid text", -1)); // Expected: Error
} catch (e) {
    console.log(e.message); // Expected error message
}