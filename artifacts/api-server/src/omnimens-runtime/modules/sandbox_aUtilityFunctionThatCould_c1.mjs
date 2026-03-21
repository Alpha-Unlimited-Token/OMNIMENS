/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-21T07:09:54.618Z
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
    const normalizedText = text.replace(/[^\w\s]/g, "").toLowerCase();

    // Split text into words
    const words = normalizedText.split(/\s+/).filter(word => word.length > 0);

    // Count word frequencies
    const wordCounts = {};
    for (let word of words) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
    }

    // Convert word counts to an array and sort by frequency
    const sortedWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);

    // Extract the top N words
    const mostFrequentWords = sortedWords.slice(0, topN).map(entry => ({
        word: entry[0],
        count: entry[1]
    }));

    return mostFrequentWords;
}

// Self-tests
console.log("Test 1: Basic functionality");
console.log(findMostFrequentWords("This is a test. This test is only a test.", 3)); // Expected: [{word: 'test', count: 3}, {word: 'this', count: 2}, {word: 'is', count: 2}]

console.log("Test 2: Edge case with empty string");
console.log(findMostFrequentWords("", 3)); // Expected: []

console.log("Test 3: Edge case with topN larger than unique words");
console.log(findMostFrequentWords("apple banana apple cherry banana apple", 10)); // Expected: [{word: 'apple', count: 3}, {word: 'banana', count: 2}, {word: 'cherry', count: 1}]

console.log("Test 4: Single word text");
console.log(findMostFrequentWords("word", 1)); // Expected: [{word: 'word', count: 1}]

console.log("Test 5: Text with special characters");
console.log(findMostFrequentWords("Hello! Hello, world. World?", 2)); // Expected: [{word: 'hello', count: 2}, {word: 'world', count: 2}]

console.log("Test 6: Invalid input handling");
try {
    console.log(findMostFrequentWords(12345, 3)); // Expected: Error
} catch (e) {
    console.log(e.message); // Expected: "Invalid input: text must be a string and topN must be a positive number."
}

try {
    console.log(findMostFrequentWords("Valid text", -1)); // Expected: Error
} catch (e) {
    console.log(e.message); // Expected: "Invalid input: text must be a string and topN must be a positive number."
}