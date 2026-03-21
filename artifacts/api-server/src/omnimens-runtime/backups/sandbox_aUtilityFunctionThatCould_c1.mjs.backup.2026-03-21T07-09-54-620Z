/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-21T06:46:56.323Z
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
    // Function to find the most frequent words in a given text
    if (typeof text !== 'string' || typeof topN !== 'number' || topN <= 0) {
        throw new Error('Invalid input: text must be a string and topN must be a positive number.');
    }

    // Remove punctuation and convert to lowercase
    const cleanedText = text.replace(/[^\w\s]/g, '').toLowerCase();

    // Split text into words
    const words = cleanedText.split(/\s+/);

    // Count occurrences of each word
    const wordCounts = {};
    for (let word of words) {
        if (word) {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
    }

    // Convert wordCounts to an array of [word, count] pairs
    const wordArray = Object.entries(wordCounts);

    // Sort by count in descending order
    wordArray.sort((a, b) => b[1] - a[1]);

    // Extract the top N words
    return wordArray.slice(0, topN).map(([word, count]) => ({ word, count }));
}

// Test cases
console.log(findMostFrequentWords("This is a test. This test is only a test.", 3));
// Expected output: [{ word: 'test', count: 3 }, { word: 'this', count: 2 }, { word: 'is', count: 2 }]

console.log(findMostFrequentWords("Hello world! Hello universe. Hello everyone.", 2));
// Expected output: [{ word: 'hello', count: 3 }, { word: 'world', count: 1 }]

console.log(findMostFrequentWords("One fish, two fish, red fish, blue fish.", 4));
// Expected output: [{ word: 'fish', count: 4 }, { word: 'one', count: 1 }, { word: 'two', count: 1 }, { word: 'red', count: 1 }]

console.log(findMostFrequentWords("", 5));
// Expected output: []

console.log(findMostFrequentWords("SingleWord", 1));
// Expected output: [{ word: 'singleword', count: 1 }]