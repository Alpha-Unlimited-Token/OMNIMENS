/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-22T23:08:52.595Z
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
        throw new Error('Invalid input: text must be a string and topN must be a positive number.');
    }

    // Normalize text: remove punctuation and convert to lowercase
    const normalizedText = text.toLowerCase().replace(/[^a-z\s]/g, '');

    // Split text into words
    const words = normalizedText.split(/\s+/).filter(word => word.length > 0);

    // Count word frequencies
    const wordCounts = {};
    for (const word of words) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
    }

    // Sort words by frequency and extract the top N
    const sortedWords = Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map(entry => ({ word: entry[0], count: entry[1] }));

    return sortedWords;
}

// Self-tests
function runTests() {
    console.log('Running tests...');

    // Test case 1: Basic functionality
    const text1 = "Hello world! Hello again, world. Hello!";
    const result1 = findMostFrequentWords(text1, 2);
    console.log(result1); // Expected: [{ word: 'hello', count: 3 }, { word: 'world', count: 2 }]

    // Test case 2: Edge case - empty text
    const text2 = "";
    const result2 = findMostFrequentWords(text2, 3);
    console.log(result2); // Expected: []

    // Test case 3: Edge case - topN larger than unique words
    const text3 = "AI AI AI machine learning";
    const result3 = findMostFrequentWords(text3, 10);
    console.log(result3); // Expected: [{ word: 'ai', count: 3 }, { word: 'machine', count: 1 }, { word: 'learning', count: 1 }]

    // Test case 4: Edge case - text with special characters
    const text4 = "Data, data, data! Science; science.";
    const result4 = findMostFrequentWords(text4, 2);
    console.log(result4); // Expected: [{ word: 'data', count: 3 }, { word: 'science', count: 2 }]

    // Test case 5: Invalid input
    try {
        findMostFrequentWords(12345, 2);
    } catch (error) {
        console.log(error.message); // Expected: "Invalid input: text must be a string and topN must be a positive number."
    }

    try {
        findMostFrequentWords("Valid text", -1);
    } catch (error) {
        console.log(error.message); // Expected: "Invalid input: text must be a string and topN must be a positive number."
    }

    console.log('Tests completed.');
}

runTests();