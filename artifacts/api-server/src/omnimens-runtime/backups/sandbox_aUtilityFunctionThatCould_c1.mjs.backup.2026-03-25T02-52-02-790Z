/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-25T02:07:13.385Z
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
        throw new Error("Invalid input: text must be a string and topN must be a positive number.");
    }

    // Normalize text by converting to lowercase and removing non-alphanumeric characters
    const normalizedText = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');

    // Split text into words
    const words = normalizedText.split(/\s+/).filter(word => word.length > 0);

    // Count occurrences of each word
    const wordCounts = {};
    for (const word of words) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
    }

    // Convert wordCounts object into an array of [word, count] pairs
    const wordCountArray = Object.entries(wordCounts);

    // Sort by count in descending order
    wordCountArray.sort((a, b) => b[1] - a[1]);

    // Return the top N most frequent words
    return wordCountArray.slice(0, topN).map(([word, count]) => ({ word, count }));
}

// Self-tests
console.log("Test 1: Basic text analysis");
console.log(findMostFrequentWords("The quick brown fox jumps over the lazy dog. The dog was not amused.", 3));
// Expected output: [{ word: 'the', count: 3 }, { word: 'dog', count: 2 }, { word: 'quick', count: 1 }]

console.log("Test 2: Edge case with special characters");
console.log(findMostFrequentWords("Hello!!! Hello... World??? World World!", 2));
// Expected output: [{ word: 'world', count: 3 }, { word: 'hello', count: 2 }]

console.log("Test 3: Single word repeated");
console.log(findMostFrequentWords("test test test test test", 1));
// Expected output: [{ word: 'test', count: 5 }]

console.log("Test 4: Empty string input");
console.log(findMostFrequentWords("", 5));
// Expected output: []

console.log("Test 5: Large input with topN greater than unique words");
console.log(findMostFrequentWords("AI AI AI is amazing. AI is the future!", 10));
// Expected output: [{ word: 'ai', count: 4 }, { word: 'is', count: 2 }, { word: 'amazing', count: 1 }, { word: 'the', count: 1 }, { word: 'future', count: 1 }]