/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-22T18:31:08.047Z
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

    // Normalize text: remove punctuation and convert to lowercase
    const normalizedText = text.replace(/[^\w\s]/g, '').toLowerCase();

    // Split text into words
    const words = normalizedText.split(/\s+/).filter(Boolean);

    // Count word frequencies
    const wordCounts = {};
    for (let word of words) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
    }

    // Convert word counts to an array and sort by frequency (descending)
    const sortedWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);

    // Return the top N most frequent words
    return sortedWords.slice(0, topN).map(entry => ({ word: entry[0], count: entry[1] }));
}

// Self-tests
function runTests() {
    console.log("Test 1: Basic functionality");
    const text1 = "This is a test. This test is only a test.";
    const result1 = findMostFrequentWords(text1, 2);
    console.log(result1); // Expected: [{ word: 'test', count: 3 }, { word: 'this', count: 2 }]

    console.log("Test 2: Case insensitivity");
    const text2 = "Apple apple apple banana BANANA banana.";
    const result2 = findMostFrequentWords(text2, 1);
    console.log(result2); // Expected: [{ word: 'apple', count: 3 }]

    console.log("Test 3: Handling punctuation");
    const text3 = "Hello, world! Hello world?";
    const result3 = findMostFrequentWords(text3, 2);
    console.log(result3); // Expected: [{ word: 'hello', count: 2 }, { word: 'world', count: 2 }]

    console.log("Test 4: Edge case - empty string");
    const text4 = "";
    const result4 = findMostFrequentWords(text4, 3);
    console.log(result4); // Expected: []

    console.log("Test 5: Edge case - topN greater than unique words");
    const text5 = "One word one word.";
    const result5 = findMostFrequentWords(text5, 5);
    console.log(result5); // Expected: [{ word: 'one', count: 2 }, { word: 'word', count: 2 }]

    console.log("Test 6: Invalid inputs");
    try {
        findMostFrequentWords(123, 2);
    } catch (e) {
        console.log(e.message); // Expected: Error message
    }

    try {
        findMostFrequentWords("Valid text", -1);
    } catch (e) {
        console.log(e.message); // Expected: Error message
    }
}

// Run tests
runTests();