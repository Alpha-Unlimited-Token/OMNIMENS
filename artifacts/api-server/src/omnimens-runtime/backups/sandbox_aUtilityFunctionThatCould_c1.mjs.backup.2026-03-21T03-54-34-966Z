/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-21T03:36:32.927Z
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
    const words = normalizedText.split(/\s+/);

    // Count word frequencies
    const wordCount = {};
    for (let word of words) {
        if (word) {
            wordCount[word] = (wordCount[word] || 0) + 1;
        }
    }

    // Sort words by frequency and extract topN
    const sortedWords = Object.entries(wordCount).sort((a, b) => b[1] - a[1]);
    const mostFrequentWords = sortedWords.slice(0, topN).map(entry => ({ word: entry[0], count: entry[1] }));

    return mostFrequentWords;
}

// Self-tests
console.log("Test Case 1:");
console.log(findMostFrequentWords("This is a test. This test is only a test.", 3));
// Expected output: [{word: 'test', count: 3}, {word: 'this', count: 2}, {word: 'is', count: 2}]

console.log("Test Case 2:");
console.log(findMostFrequentWords("Hello world! Hello universe. Hello everyone.", 2));
// Expected output: [{word: 'hello', count: 3}, {word: 'world', count: 1}]

console.log("Test Case 3:");
console.log(findMostFrequentWords("One fish two fish red fish blue fish.", 4));
// Expected output: [{word: 'fish', count: 4}, {word: 'one', count: 1}, {word: 'two', count: 1}, {word: 'red', count: 1}]

console.log("Test Case 4:");
console.log(findMostFrequentWords("", 5));
// Expected output: []

console.log("Test Case 5:");
try {
    console.log(findMostFrequentWords(12345, 3));
} catch (e) {
    console.log(e.message); // Expected: "Invalid input: text must be a string and topN must be a positive number."
}