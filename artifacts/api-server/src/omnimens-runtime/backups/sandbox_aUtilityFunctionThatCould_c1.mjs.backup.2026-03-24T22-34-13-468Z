/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-24T22:18:59.291Z
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

    // Normalize text and split into words
    const words = text.toLowerCase().match(/\b\w+\b/g);
    if (!words) return [];

    // Count occurrences of each word
    const wordCounts = {};
    for (const word of words) {
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
console.log(findMostFrequentWords("This is a test. This test is only a test.", 3)); 
// Expected output: [{word: 'test', count: 3}, {word: 'this', count: 2}, {word: 'is', count: 2}]

console.log(findMostFrequentWords("Hello world! Hello AI. AI is the future.", 2)); 
// Expected output: [{word: 'hello', count: 2}, {word: 'ai', count: 2}]

console.log(findMostFrequentWords("One fish, two fish, red fish, blue fish.", 4)); 
// Expected output: [{word: 'fish', count: 4}, {word: 'one', count: 1}, {word: 'two', count: 1}, {word: 'red', count: 1}]

console.log(findMostFrequentWords("", 5)); 
// Expected output: []

console.log(findMostFrequentWords("SingleWord", 1)); 
// Expected output: [{word: 'singleword', count: 1}]