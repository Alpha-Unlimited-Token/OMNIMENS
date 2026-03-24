/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-24T05:47:25.687Z
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
    if (typeof text !== 'string' || typeof topN !== 'number' || topN < 1) {
        throw new Error('Invalid input: text must be a string and topN must be a positive number.');
    }

    // Normalize text: convert to lowercase and remove non-alphanumeric characters
    const normalizedText = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');

    // Split text into words
    const words = normalizedText.split(/\s+/).filter(word => word.length > 0);

    // Count word frequencies
    const wordCounts = {};
    for (let word of words) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
    }

    // Sort words by frequency
    const sortedWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);

    // Extract the top N words
    const topWords = sortedWords.slice(0, topN).map(entry => ({ word: entry[0], count: entry[1] }));

    return topWords;
}

// Self-tests
console.log('Test 1: Basic functionality');
const text1 = "The quick brown fox jumps over the lazy dog. The dog was not amused.";
const result1 = findMostFrequentWords(text1, 3);
console.log(result1); // Expected output: [{word: 'the', count: 3}, {word: 'dog', count: 2}, {word: 'brown', count: 1}]

console.log('Test 2: Edge case - empty string');
const text2 = "";
const result2 = findMostFrequentWords(text2, 3);
console.log(result2); // Expected output: []

console.log('Test 3: Edge case - topN larger than unique words');
const text3 = "apple banana apple orange banana apple";
const result3 = findMostFrequentWords(text3, 10);
console.log(result3); // Expected output: [{word: 'apple', count: 3}, {word: 'banana', count: 2}, {word: 'orange', count: 1}]

console.log('Test 4: Case insensitivity and punctuation removal');
const text4 = "Hello, hello! HELLO world... World?";
const result4 = findMostFrequentWords(text4, 2);
console.log(result4); // Expected output: [{word: 'hello', count: 3}, {word: 'world', count: 2}]

console.log('Test 5: Invalid input');
try {
    findMostFrequentWords(12345, 3);
} catch (error) {
    console.log(error.message); // Expected output: Invalid input: text must be a string and topN must be a positive number.
}