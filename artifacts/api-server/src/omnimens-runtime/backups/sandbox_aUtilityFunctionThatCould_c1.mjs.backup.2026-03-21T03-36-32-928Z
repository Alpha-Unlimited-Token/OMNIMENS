/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-21T03:28:24.221Z
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

    // Normalize text by converting to lowercase and removing non-alphanumeric characters
    const normalizedText = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const words = normalizedText.split(/\s+/).filter(word => word.length > 0);

    // Count word frequencies
    const wordCounts = {};
    for (const word of words) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
    }

    // Convert wordCounts to an array and sort by frequency
    const sortedWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);

    // Return the top N most frequent words
    return sortedWords.slice(0, topN).map(([word, count]) => ({ word, count }));
}

// Self-tests
function runTests() {
    console.log("Running tests...");

    const text1 = "This is a test. This test is only a test.";
    const result1 = findMostFrequentWords(text1, 2);
    console.log(result1); // Expected: [{ word: 'test', count: 3 }, { word: 'this', count: 2 }]

    const text2 = "Hello world! Hello again, world.";
    const result2 = findMostFrequentWords(text2, 3);
    console.log(result2); // Expected: [{ word: 'hello', count: 2 }, { word: 'world', count: 2 }, { word: 'again', count: 1 }]

    const text3 = "A quick brown fox jumps over the lazy dog.";
    const result3 = findMostFrequentWords(text3, 5);
    console.log(result3); // Expected: [{ word: 'a', count: 1 }, { word: 'quick', count: 1 }, ...]

    const text4 = "Repeated repeated repeated words words.";
    const result4 = findMostFrequentWords(text4, 1);
    console.log(result4); // Expected: [{ word: 'repeated', count: 3 }]

    try {
        findMostFrequentWords(12345, 2);
    } catch (e) {
        console.log(e.message); // Expected: Error about invalid input
    }

    try {
        findMostFrequentWords("Valid text", -1);
    } catch (e) {
        console.log(e.message); // Expected: Error about invalid input
    }

    console.log("All tests completed.");
}

runTests();