/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-24T22:34:13.466Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function extractKeywords(text, minLength = 4) {
    // Remove punctuation and split text into words
    const words = text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/);

    // Count occurrences of each word
    const wordCounts = words.reduce((counts, word) => {
        if (word.length >= minLength) {
            counts[word] = (counts[word] || 0) + 1;
        }
        return counts;
    }, {});

    // Convert the word counts object to an array of [word, count] pairs
    const wordEntries = Object.entries(wordCounts);

    // Sort by frequency in descending order
    wordEntries.sort((a, b) => b[1] - a[1]);

    // Return the sorted array of keywords
    return wordEntries.map(entry => ({ word: entry[0], count: entry[1] }));
}

// Test cases
const testText1 = "Artificial intelligence raises concerns about accountability when AI agents act beyond user intent.";
const testText2 = "Generative AI uses models to create new content, enhancing creativity and automation.";
const testText3 = "Speed is king in the digital realm; optimizing routes and reducing latency enhances performance.";

console.log("Test 1:", extractKeywords(testText1));
console.log("Test 2:", extractKeywords(testText2));
console.log("Test 3:", extractKeywords(testText3));

// Edge case: Empty string
console.log("Test 4 (empty string):", extractKeywords(""));

// Edge case: Short words only
console.log("Test 5 (short words):", extractKeywords("a an is of to in on"));

// Edge case: Custom minimum length
console.log("Test 6 (minLength = 5):", extractKeywords(testText1, 5));