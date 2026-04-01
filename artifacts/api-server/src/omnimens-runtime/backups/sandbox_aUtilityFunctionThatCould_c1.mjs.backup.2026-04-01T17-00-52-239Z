/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-04-01T16:50:41.308Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function: Find the most frequent n-grams in a given text
function findFrequentNGrams(text, n, topK) {
    if (typeof text !== 'string' || typeof n !== 'number' || typeof topK !== 'number') {
        throw new TypeError('Invalid input types. Expected (string, number, number).');
    }
    if (n <= 0 || topK <= 0) {
        throw new RangeError('n and topK must be positive integers.');
    }

    const words = text.split(/\s+/).filter(word => word.trim() !== '');
    if (words.length < n) {
        return [];
    }

    const nGramCounts = new Map();

    for (let i = 0; i <= words.length - n; i++) {
        const nGram = words.slice(i, i + n).join(' ');
        nGramCounts.set(nGram, (nGramCounts.get(nGram) || 0) + 1);
    }

    const sortedNGrams = Array.from(nGramCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, topK);

    return sortedNGrams.map(([nGram, count]) => ({ nGram, count }));
}

// Test cases
const testText = "this is a test this is only a test this is a test of the emergency broadcast system";

// Test case 1: Find top 2 most frequent bigrams (n=2)
const result1 = findFrequentNGrams(testText, 2, 2);
console.log(result1);
console.assert(result1.length === 2, "Test case 1 failed");
console.assert(result1[0].nGram === "this is" && result1[0].count === 3, "Test case 1 failed");
console.assert(result1[1].nGram === "is a" && result1[1].count === 3, "Test case 1 failed");

// Test case 2: Find top 3 most frequent trigrams (n=3)
const result2 = findFrequentNGrams(testText, 3, 3);
console.log(result2);
console.assert(result2.length === 3, "Test case 2 failed");
console.assert(result2[0].nGram === "this is a" && result2[0].count === 2, "Test case 2 failed");
console.assert(result2[1].nGram === "is a test" && result2[1].count === 2, "Test case 2 failed");
console.assert(result2[2].nGram === "a test this" && result2[2].count === 1, "Test case 2 failed");

// Test case 3: Edge case - n larger than number of words
const result3 = findFrequentNGrams("short text", 5, 2);
console.log(result3);
console.assert(result3.length === 0, "Test case 3 failed");

// Test case 4: Edge case - empty text
const result4 = findFrequentNGrams("", 2, 2);
console.log(result4);
console.assert(result4.length === 0, "Test case 4 failed");

// Test case 5: Edge case - single word text
const result5 = findFrequentNGrams("word", 1, 1);
console.log(result5);
console.assert(result5.length === 1 && result5[0].nGram === "word" && result5[0].count === 1, "Test case 5 failed");