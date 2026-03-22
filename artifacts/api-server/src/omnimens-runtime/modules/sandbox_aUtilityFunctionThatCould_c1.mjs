/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-22T22:44:02.099Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function findMostFrequentPatterns(text, patternLength) {
    if (typeof text !== 'string' || typeof patternLength !== 'number' || patternLength <= 0) {
        throw new Error('Invalid input: text must be a string and patternLength must be a positive number.');
    }

    const patternFrequency = new Map();

    for (let i = 0; i <= text.length - patternLength; i++) {
        const pattern = text.slice(i, i + patternLength);
        patternFrequency.set(pattern, (patternFrequency.get(pattern) || 0) + 1);
    }

    const sortedPatterns = Array.from(patternFrequency.entries()).sort((a, b) => b[1] - a[1]);

    const mostFrequentPatterns = [];
    const highestFrequency = sortedPatterns.length > 0 ? sortedPatterns[0][1] : 0;

    for (const [pattern, frequency] of sortedPatterns) {
        if (frequency === highestFrequency) {
            mostFrequentPatterns.push({ pattern, frequency });
        } else {
            break;
        }
    }

    return mostFrequentPatterns;
}

// Test cases
console.log(findMostFrequentPatterns("abababab", 2)); // Expected: [{ pattern: 'ab', frequency: 4 }]
console.log(findMostFrequentPatterns("abcabcabc", 3)); // Expected: [{ pattern: 'abc', frequency: 3 }]
console.log(findMostFrequentPatterns("aaaaaa", 1)); // Expected: [{ pattern: 'a', frequency: 6 }]
console.log(findMostFrequentPatterns("abcdef", 2)); // Expected: [{ pattern: 'ab', frequency: 1 }, { pattern: 'bc', frequency: 1 }, { pattern: 'cd', frequency: 1 }, { pattern: 'de', frequency: 1 }, { pattern: 'ef', frequency: 1 }]
console.log(findMostFrequentPatterns("", 2)); // Expected: []
console.log(findMostFrequentPatterns("a", 2)); // Expected: []