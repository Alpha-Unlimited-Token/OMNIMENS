/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-04-01T13:50:17.363Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function: findMostFrequentWords
// This function takes a string and returns the N most frequent words in the text.
// It is useful for text analysis and pattern recognition in AI systems.

function findMostFrequentWords(text, n) {
    if (typeof text !== 'string' || typeof n !== 'number' || n <= 0) {
        throw new TypeError('Invalid input: text must be a string and n must be a positive number.');
    }

    // Normalize text: remove punctuation, convert to lowercase, and split into words
    const words = text
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .toLowerCase()
        .split(/\s+/); // Split by whitespace

    // Count word frequencies
    const wordCounts = {};
    for (const word of words) {
        if (word) {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
    }

    // Convert to array and sort by frequency (descending), then alphabetically for ties
    const sortedWords = Object.entries(wordCounts).sort((a, b) => {
        if (b[1] === a[1]) {
            return a[0].localeCompare(b[0]);
        }
        return b[1] - a[1];
    });

    // Return the top N words
    return sortedWords.slice(0, n).map(entry => ({ word: entry[0], count: entry[1] }));
}

// Test cases
console.log('Test Case 1');
console.log(findMostFrequentWords('This is a test. This test is only a test.', 3));
// Expected output: [{ word: 'test', count: 3 }, { word: 'this', count: 2 }, { word: 'is', count: 2 }]

console.log('Test Case 2');
console.log(findMostFrequentWords('Hello world! Hello AI. Hello future.', 2));
// Expected output: [{ word: 'hello', count: 3 }, { word: 'ai', count: 1 }]

console.log('Test Case 3');
console.log(findMostFrequentWords('One fish, two fish, red fish, blue fish.', 4));
// Expected output: [{ word: 'fish', count: 4 }, { word: 'blue', count: 1 }, { word: 'one', count: 1 }, { word: 'red', count: 1 }]

console.log('Test Case 4');
console.log(findMostFrequentWords('AI AI AI AI AI!', 1));
// Expected output: [{ word: 'ai', count: 5 }]

console.log('Test Case 5');
console.log(findMostFrequentWords('', 3));
// Expected output: []

console.log('Test Case 6');
try {
    console.log(findMostFrequentWords(12345, 3));
} catch (e) {
    console.log(e.message); // Expected output: Invalid input: text must be a string and n must be a positive number.
}