/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-24T02:45:56.025Z
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
        throw new Error('Invalid input: text must be a string and patternLength must be a positive integer.');
    }

    const patternCounts = new Map();

    for (let i = 0; i <= text.length - patternLength; i++) {
        const pattern = text.substring(i, i + patternLength);
        patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
    }

    let maxFrequency = 0;
    const mostFrequentPatterns = [];

    patternCounts.forEach((count, pattern) => {
        if (count > maxFrequency) {
            maxFrequency = count;
            mostFrequentPatterns.length = 0;
            mostFrequentPatterns.push(pattern);
        } else if (count === maxFrequency) {
            mostFrequentPatterns.push(pattern);
        }
    });

    return { patterns: mostFrequentPatterns, frequency: maxFrequency };
}

// Test cases
console.log(findMostFrequentPatterns("abababab", 2)); // { patterns: [ 'ab', 'ba' ], frequency: 4 }
console.log(findMostFrequentPatterns("abcabcabc", 3)); // { patterns: [ 'abc' ], frequency: 3 }
console.log(findMostFrequentPatterns("aaaaaa", 2)); // { patterns: [ 'aa' ], frequency: 5 }
console.log(findMostFrequentPatterns("abcdef", 3)); // { patterns: [ 'abc', 'bcd', 'cde', 'def' ], frequency: 1 }
console.log(findMostFrequentPatterns("a", 1)); // { patterns: [ 'a' ], frequency: 1 }
console.log(findMostFrequentPatterns("", 1)); // { patterns: [], frequency: 0 }
console.log(findMostFrequentPatterns("abc", 4)); // { patterns: [], frequency: 0 }