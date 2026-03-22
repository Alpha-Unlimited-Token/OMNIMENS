/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-22T04:22:20.224Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function findMostFrequentPatterns(text, n) {
    // Function to find the top N most frequent patterns (words or phrases) in a given text
    function tokenize(text) {
        // Tokenize text into words, removing punctuation and converting to lowercase
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 0);
    }

    function generatePatterns(tokens, length) {
        // Generate all possible patterns of a given length
        const patterns = [];
        for (let i = 0; i <= tokens.length - length; i++) {
            patterns.push(tokens.slice(i, i + length).join(' '));
        }
        return patterns;
    }

    function countOccurrences(patterns) {
        // Count occurrences of each pattern
        const counts = new Map();
        for (const pattern of patterns) {
            counts.set(pattern, (counts.get(pattern) || 0) + 1);
        }
        return counts;
    }

    function sortByFrequency(counts) {
        // Sort patterns by frequency in descending order
        return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    }

    const tokens = tokenize(text);
    const allPatterns = [];
    for (let length = 1; length <= 3; length++) {
        allPatterns.push(...generatePatterns(tokens, length));
    }
    const counts = countOccurrences(allPatterns);
    const sortedPatterns = sortByFrequency(counts);
    return sortedPatterns.slice(0, n).map(([pattern, count]) => ({ pattern, count }));
}

// Self-tests
console.log("Test Case 1:");
console.log(findMostFrequentPatterns("This is a test. This test is only a test.", 3));

console.log("Test Case 2:");
console.log(findMostFrequentPatterns("AI systems are evolving rapidly. AI systems are transforming industries.", 5));

console.log("Test Case 3:");
console.log(findMostFrequentPatterns("Pattern matching is useful. Pattern recognition is key for AI.", 4));

console.log("Test Case 4:");
console.log(findMostFrequentPatterns("", 3)); // Edge case: empty text

console.log("Test Case 5:");
console.log(findMostFrequentPatterns("Single word repeated repeated repeated.", 2)); // Edge case: repeated single word