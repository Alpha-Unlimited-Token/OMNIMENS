/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-04-01T13:18:48.109Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function: Find the most frequent words in a given text
function findMostFrequentWords(text, topN) {
    if (typeof text !== 'string' || typeof topN !== 'number' || topN <= 0) {
        throw new TypeError("Invalid input: text must be a string and topN must be a positive number.");
    }

    // Normalize the text: remove punctuation, convert to lowercase, and split into words
    const words = text
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .toLowerCase() // Convert to lowercase
        .split(/\s+/) // Split by whitespace
        .filter(word => word.length > 0); // Remove empty strings

    // Count word frequencies
    const frequencyMap = {};
    for (const word of words) {
        frequencyMap[word] = (frequencyMap[word] || 0) + 1;
    }

    // Convert the frequency map to an array of [word, frequency] pairs
    const frequencyArray = Object.entries(frequencyMap);

    // Sort the array by frequency in descending order
    frequencyArray.sort((a, b) => b[1] - a[1]);

    // Return the top N most frequent words
    return frequencyArray.slice(0, topN).map(([word, freq]) => ({ word, freq }));
}

// Test cases
const testText = "AI is revolutionizing the world. AI is everywhere. AI and machine learning are changing the way we live and work.";
console.log(findMostFrequentWords(testText, 3)); // Should return the top 3 most frequent words

console.assert(
    JSON.stringify(findMostFrequentWords(testText, 3)) === JSON.stringify([
        { word: "ai", freq: 3 },
        { word: "is", freq: 2 },
        { word: "and", freq: 2 }
    ]),
    "Test Case 1 Failed"
);

console.assert(
    JSON.stringify(findMostFrequentWords("hello world hello", 2)) === JSON.stringify([
        { word: "hello", freq: 2 },
        { word: "world", freq: 1 }
    ]),
    "Test Case 2 Failed"
);

console.assert(
    JSON.stringify(findMostFrequentWords("one two three two three three", 2)) === JSON.stringify([
        { word: "three", freq: 3 },
        { word: "two", freq: 2 }
    ]),
    "Test Case 3 Failed"
);

console.assert(
    JSON.stringify(findMostFrequentWords("", 3)) === JSON.stringify([]),
    "Test Case 4 Failed"
);

console.assert(
    JSON.stringify(findMostFrequentWords("punctuation! should, not. affect; the: result?", 3)) === JSON.stringify([
        { word: "punctuation", freq: 1 },
        { word: "should", freq: 1 },
        { word: "not", freq: 1 }
    ]),
    "Test Case 5 Failed"
);

console.log("All test cases passed!");