/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-23T01:58:21.817Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function for text analysis: Extract and count unique words from a given text
function extractUniqueWords(text) {
    if (typeof text !== 'string') {
        throw new Error("Input must be a string");
    }

    // Normalize text: Remove punctuation, convert to lowercase, and split into words
    const words = text
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove non-alphanumeric characters
        .toLowerCase()
        .split(/\s+/); // Split by whitespace

    // Use a Map to count occurrences of each unique word
    const wordCounts = new Map();
    for (const word of words) {
        if (word) { // Ignore empty strings
            wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
        }
    }

    // Convert Map to an array of objects for better readability
    const result = [];
    wordCounts.forEach((count, word) => {
        result.push({ word, count });
    });

    // Sort results by word alphabetically
    result.sort((a, b) => a.word.localeCompare(b.word));

    return result;
}

// Test cases
function runTests() {
    console.log("Test Case 1: Simple sentence");
    console.log(extractUniqueWords("Hello world! Hello again, world."));
    // Expected output: [ { word: 'again', count: 1 }, { word: 'hello', count: 2 }, { word: 'world', count: 2 } ]

    console.log("Test Case 2: Empty string");
    console.log(extractUniqueWords(""));
    // Expected output: []

    console.log("Test Case 3: Numbers and mixed characters");
    console.log(extractUniqueWords("123 123 test TEST test123!"));
    // Expected output: [ { word: '123', count: 2 }, { word: 'test', count: 1 }, { word: 'test123', count: 1 } ]

    console.log("Test Case 4: Special characters only");
    console.log(extractUniqueWords("!@#$%^&*()"));
    // Expected output: []

    console.log("Test Case 5: Case insensitivity");
    console.log(extractUniqueWords("Apple apple APPLE"));
    // Expected output: [ { word: 'apple', count: 3 } ]
}

// Run tests
runTests();