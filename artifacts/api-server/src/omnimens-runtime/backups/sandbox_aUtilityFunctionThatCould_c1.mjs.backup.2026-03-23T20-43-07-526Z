/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-23T18:46:56.386Z
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
    if (typeof text !== "string" || typeof topN !== "number" || topN <= 0) {
        throw new Error("Invalid input: text must be a string and topN must be a positive number.");
    }

    // Normalize text by removing punctuation and converting to lowercase
    const normalizedText = text.replace(/[^\w\s]/g, "").toLowerCase();

    // Split text into words
    const words = normalizedText.split(/\s+/);

    // Count word frequencies
    const wordCounts = {};
    for (const word of words) {
        if (word) {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
    }

    // Convert wordCounts to an array of [word, count] pairs and sort by count
    const sortedWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);

    // Return the top N most frequent words
    return sortedWords.slice(0, topN).map(([word, count]) => ({ word, count }));
}

// Self-tests
function runTests() {
    const text1 = "The quick brown fox jumps over the lazy dog. The dog was not amused.";
    const text2 = "Data processing is essential for AI systems. AI systems rely on data processing.";
    const text3 = "";

    console.log("Test 1:");
    console.log(findMostFrequentWords(text1, 3)); // Expected: [{word: "the", count: 3}, {word: "dog", count: 2}, {word: "fox", count: 1}]

    console.log("Test 2:");
    console.log(findMostFrequentWords(text2, 2)); // Expected: [{word: "data", count: 2}, {word: "ai", count: 2}]

    console.log("Test 3:");
    console.log(findMostFrequentWords(text3, 1)); // Expected: []

    console.log("Edge Case 1:");
    console.log(findMostFrequentWords("Hello, hello, HELLO!", 1)); // Expected: [{word: "hello", count: 3}]

    console.log("Edge Case 2:");
    console.log(findMostFrequentWords("One word only.", 5)); // Expected: [{word: "one", count: 1}, {word: "word", count: 1}, {word: "only", count: 1}]
}

runTests();