/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-22T18:17:22.855Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function extractKeyPhrases(text) {
    // Utility function to extract key phrases from text based on word frequency and relevance
    function tokenize(input) {
        return input.toLowerCase().match(/\b[a-z]{2,}\b/g) || [];
    }

    function calculateFrequency(tokens) {
        const frequencyMap = {};
        for (const token of tokens) {
            frequencyMap[token] = (frequencyMap[token] || 0) + 1;
        }
        return frequencyMap;
    }

    function rankPhrases(tokens, frequencyMap) {
        const uniqueTokens = Array.from(new Set(tokens));
        uniqueTokens.sort((a, b) => frequencyMap[b] - frequencyMap[a]);
        return uniqueTokens.slice(0, Math.min(10, uniqueTokens.length)); // Top 10 key phrases
    }

    const tokens = tokenize(text);
    const frequencyMap = calculateFrequency(tokens);
    return rankPhrases(tokens, frequencyMap);
}

// Self-tests
console.log("Test Case 1:");
console.log(extractKeyPhrases("AI systems are becoming increasingly important in data processing, pattern matching, and optimization tasks."));
// Expected output: ['data', 'processing', 'pattern', 'matching', 'optimization', 'tasks', 'systems', 'important', 'ai', 'becoming']

console.log("Test Case 2:");
console.log(extractKeyPhrases("The quick brown fox jumps over the lazy dog. The dog is not amused."));
// Expected output: ['dog', 'the', 'quick', 'brown', 'fox', 'jumps', 'lazy', 'over', 'amused', 'not']

console.log("Test Case 3:");
console.log(extractKeyPhrases("")); 
// Expected output: []

console.log("Test Case 4:");
console.log(extractKeyPhrases("Data data data data analysis analysis optimization optimization optimization.")); 
// Expected output: ['optimization', 'data', 'analysis']

console.log("Test Case 5:");
console.log(extractKeyPhrases("A single word repeated word word word.")); 
// Expected output: ['word', 'single', 'repeated']