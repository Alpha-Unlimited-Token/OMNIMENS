/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-22T17:19:55.184Z
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
        throw new Error("Invalid input: text must be a string and topN must be a positive number.");
    }

    // Normalize text: remove punctuation, convert to lowercase
    const normalizedText = text.replace(/[^\w\s]/g, '').toLowerCase();

    // Split text into words
    const words = normalizedText.split(/\s+/).filter(word => word.length > 0);

    // Count word frequencies
    const wordCounts = {};
    for (let word of words) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
    }

    // Convert wordCounts to an array of [word, count] pairs
    const wordArray = Object.entries(wordCounts);

    // Sort by frequency in descending order
    wordArray.sort((a, b) => b[1] - a[1]);

    // Extract topN words
    const topWords = wordArray.slice(0, topN);

    return topWords;
}

// Self-tests
console.log("Test 1: Basic functionality");
const text1 = "The quick brown fox jumps over the lazy dog. The dog was not amused.";
console.log(findMostFrequentWords(text1, 3)); // Expected output: [['the', 3], ['dog', 2], ['quick', 1]]

console.log("Test 2: Single word input");
const text2 = "hello";
console.log(findMostFrequentWords(text2, 1)); // Expected output: [['hello', 1]]

console.log("Test 3: Case insensitivity");
const text3 = "Apple apple APPLE";
console.log(findMostFrequentWords(text3, 1)); // Expected output: [['apple', 3]]

console.log("Test 4: Edge case - empty string");
try {
    console.log(findMostFrequentWords("", 3)); // Expected output: []
} catch (e) {
    console.log(e.message); // Expected error message
}

console.log("Test 5: Edge case - invalid topN");
try {
    console.log(findMostFrequentWords("hello world", -1)); // Expected error
} catch (e) {
    console.log(e.message); // Expected error message
}

console.log("Test 6: Edge case - punctuation handling");
const text4 = "Hello, world! Hello: world?";
console.log(findMostFrequentWords(text4, 2)); // Expected output: [['hello', 2], ['world', 2]]