/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-21T02:17:09.796Z
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
    // Utility function to find the most frequent words in a given text
    if (typeof text !== 'string' || typeof topN !== 'number' || topN <= 0) {
        throw new Error('Invalid input: text must be a string and topN must be a positive number.');
    }

    // Clean up the text and split into words
    const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
    
    // Count occurrences of each word
    const wordCounts = {};
    for (let word of words) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
    }

    // Sort words by frequency and return the top N
    const sortedWords = Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map(entry => ({ word: entry[0], count: entry[1] }));

    return sortedWords;
}

// Self-tests
console.log('Test Case 1: Basic input');
console.log(findMostFrequentWords('This is a test. This test is only a test.', 3)); // Expected: [{ word: 'test', count: 3 }, { word: 'this', count: 2 }, { word: 'is', count: 2 }]

console.log('Test Case 2: Input with special characters');
console.log(findMostFrequentWords('Hello, world! Hello...world?? Hello!', 2)); // Expected: [{ word: 'hello', count: 3 }, { word: 'world', count: 2 }]

console.log('Test Case 3: Edge case with empty string');
console.log(findMostFrequentWords('', 3)); // Expected: []

console.log('Test Case 4: Edge case with topN larger than unique words');
console.log(findMostFrequentWords('Unique words only.', 10)); // Expected: [{ word: 'unique', count: 1 }, { word: 'words', count: 1 }, { word: 'only', count: 1 }]

console.log('Test Case 5: Edge case with invalid inputs');
try {
    console.log(findMostFrequentWords(12345, 3)); // Expected: Error
} catch (e) {
    console.log(e.message);
}

try {
    console.log(findMostFrequentWords('Valid text', -1)); // Expected: Error
} catch (e) {
    console.log(e.message);
}