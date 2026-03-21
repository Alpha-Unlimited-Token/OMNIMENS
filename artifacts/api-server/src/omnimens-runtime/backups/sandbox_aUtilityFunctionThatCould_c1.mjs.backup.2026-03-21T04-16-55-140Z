/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-21T03:54:34.964Z
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

    // Normalize text: remove punctuation, convert to lowercase
    const normalizedText = text.replace(/[^\w\s]/g, '').toLowerCase();
    const words = normalizedText.split(/\s+/).filter(word => word.length > 0);

    // Count word frequencies
    const wordCounts = {};
    for (let word of words) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
    }

    // Sort words by frequency
    const sortedWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);

    // Return the top N most frequent words
    return sortedWords.slice(0, topN).map(entry => ({ word: entry[0], count: entry[1] }));
}

// Self-tests
console.log(findMostFrequentWords("Hello world! Hello again, world. World is beautiful.", 3)); // Expected: [{word: 'world', count: 3}, {word: 'hello', count: 2}, {word: 'is', count: 1}]
console.log(findMostFrequentWords("AI systems are evolving. AI is the future!", 2)); // Expected: [{word: 'ai', count: 2}, {word: 'systems', count: 1}]
console.log(findMostFrequentWords("One two three. Three two one. One one one.", 2)); // Expected: [{word: 'one', count: 5}, {word: 'two', count: 2}]

// Edge cases
console.log(findMostFrequentWords("", 3)); // Expected: []
console.log(findMostFrequentWords("SingleWord", 1)); // Expected: [{word: 'singleword', count: 1}]
console.log(findMostFrequentWords("Repeated repeated repeated", 1)); // Expected: [{word: 'repeated', count: 3}]