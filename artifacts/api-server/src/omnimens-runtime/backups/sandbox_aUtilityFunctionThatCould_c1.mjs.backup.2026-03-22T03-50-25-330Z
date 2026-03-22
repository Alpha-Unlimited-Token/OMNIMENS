/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-22T03:13:06.310Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function findMostFrequentWords(text, n) {
    // Function to find the top N most frequent words in a given text
    function cleanText(input) {
        return input.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(word => word.length > 0);
    }

    const wordCounts = {};
    const words = cleanText(text);

    for (let word of words) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
    }

    const sortedWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);
    return sortedWords.slice(0, n).map(entry => ({ word: entry[0], count: entry[1] }));
}

// Test cases
const testText1 = "The quick brown fox jumps over the lazy dog. The dog was not amused.";
const testText2 = "AI systems are evolving rapidly. AI is transforming industries. AI is everywhere.";
const testText3 = "Hello! Hello? Is anyone there? Hello!";

console.log("Test Case 1:");
console.log(findMostFrequentWords(testText1, 3)); // Expected: [{ word: 'the', count: 3 }, { word: 'dog', count: 2 }, { word: 'lazy', count: 1 }]

console.log("Test Case 2:");
console.log(findMostFrequentWords(testText2, 2)); // Expected: [{ word: 'ai', count: 3 }, { word: 'is', count: 2 }]

console.log("Test Case 3:");
console.log(findMostFrequentWords(testText3, 1)); // Expected: [{ word: 'hello', count: 3 }]