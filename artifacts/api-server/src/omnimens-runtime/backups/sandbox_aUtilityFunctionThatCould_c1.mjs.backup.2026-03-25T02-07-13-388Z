/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-25T01:17:31.776Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function analyzeTextPatterns(text) {
    // Utility function to analyze text patterns
    const results = {
        wordCount: 0,
        sentenceCount: 0,
        averageWordLength: 0,
        mostFrequentWords: [],
        frequencyMap: {}
    };

    // Split text into sentences
    const sentences = text.match(/[^.!?]+[.!?]/g) || [];
    results.sentenceCount = sentences.length;

    // Split text into words
    const words = text.match(/\b\w+\b/g) || [];
    results.wordCount = words.length;

    // Calculate average word length
    const totalWordLength = words.reduce((sum, word) => sum + word.length, 0);
    results.averageWordLength = words.length > 0 ? totalWordLength / words.length : 0;

    // Build frequency map for words
    const frequencyMap = {};
    for (const word of words) {
        const lowerWord = word.toLowerCase();
        frequencyMap[lowerWord] = (frequencyMap[lowerWord] || 0) + 1;
    }
    results.frequencyMap = frequencyMap;

    // Find most frequent words
    const sortedWords = Object.entries(frequencyMap).sort((a, b) => b[1] - a[1]);
    results.mostFrequentWords = sortedWords.slice(0, 5).map(([word, count]) => ({ word, count }));

    return results;
}

// Test cases
const testText1 = "Hello world! This is a test. Hello again.";
const testText2 = "AI systems are evolving rapidly. They are becoming more intelligent and capable.";
const testText3 = ""; // Edge case: empty text

console.log("Test Case 1:", analyzeTextPatterns(testText1));
console.log("Test Case 2:", analyzeTextPatterns(testText2));
console.log("Test Case 3:", analyzeTextPatterns(testText3));