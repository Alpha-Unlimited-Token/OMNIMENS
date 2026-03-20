/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-20T23:02:18.182Z
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

    const words = text.toLowerCase().match(/\b[a-z]+\b/g);
    if (!words) return [];

    const wordCounts = new Map();
    for (const word of words) {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }

    const sortedWords = Array.from(wordCounts.entries()).sort((a, b) => b[1] - a[1]);
    return sortedWords.slice(0, topN).map(([word, count]) => ({ word, count }));
}

// Test cases
console.log(findMostFrequentWords("This is a test. This test is only a test.", 3)); 
// Expected output: [{ word: 'test', count: 3 }, { word: 'this', count: 2 }, { word: 'is', count: 2 }]

console.log(findMostFrequentWords("Hello world! Hello universe. Hello everyone.", 2)); 
// Expected output: [{ word: 'hello', count: 3 }, { word: 'world', count: 1 }]

console.log(findMostFrequentWords("", 5)); 
// Expected output: []

console.log(findMostFrequentWords("Single-word!", 1)); 
// Expected output: [{ word: 'single', count: 1 }]

console.log(findMostFrequentWords("Edge case: numbers like 123 and symbols like #!", 3)); 
// Expected output: [{ word: 'edge', count: 1 }, { word: 'case', count: 1 }, { word: 'numbers', count: 1 }]