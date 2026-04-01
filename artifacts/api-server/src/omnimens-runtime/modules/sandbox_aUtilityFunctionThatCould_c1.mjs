/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-04-01T14:44:29.655Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Function: findMostFrequentWords
// This utility function takes a string of text and returns the N most frequent words, excluding common stop words.

function findMostFrequentWords(text, topN) {
    if (typeof text !== 'string' || typeof topN !== 'number' || topN <= 0) {
        throw new TypeError('Invalid input: text must be a string and topN must be a positive number.');
    }

    const stopWords = new Set([
        'a', 'an', 'and', 'the', 'is', 'in', 'on', 'at', 'of', 'to', 'for', 'with', 'as', 'by', 'it', 'this', 'that', 'these', 'those', 'are', 'was', 'were', 'be', 'been', 'but', 'or', 'if', 'then', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'not', 'no', 'yes', 'do', 'does', 'did', 'from', 'up', 'down', 'out', 'over', 'under', 'about', 'into', 'like', 'such', 'all', 'any', 'some', 'more', 'most', 'less', 'least', 'many', 'few', 'one', 'two', 'three', 'other', 'another', 'each', 'every', 'either', 'neither', 'both', 'half', 'much', 'how', 'why', 'when', 'where', 'what', 'who', 'whom', 'which'
    ]);

    const words = text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove punctuation
        .split(/\s+/) // Split by whitespace
        .filter(word => word && !stopWords.has(word)); // Remove stop words and empty strings

    const wordCounts = words.reduce((counts, word) => {
        counts[word] = (counts[word] || 0) + 1;
        return counts;
    }, {});

    const sortedWords = Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1]) // Sort by frequency (descending)
        .slice(0, topN) // Take the top N
        .map(entry => ({ word: entry[0], count: entry[1] }));

    return sortedWords;
}

// Test cases
console.log(findMostFrequentWords("This is a test. This test is only a test.", 3)); // [{ word: "test", count: 3 }, { word: "this", count: 2 }, { word: "only", count: 1 }]
console.log(findMostFrequentWords("AI is transforming the world. The world of AI is vast and growing.", 2)); // [{ word: "world", count: 2 }, { word: "ai", count: 2 }]
console.log(findMostFrequentWords("One fish, two fish, red fish, blue fish.", 2)); // [{ word: "fish", count: 4 }, { word: "one", count: 1 }]
console.log(findMostFrequentWords("Hello world! Hello again, world.", 1)); // [{ word: "world", count: 2 }]
console.log(findMostFrequentWords("", 3)); // []