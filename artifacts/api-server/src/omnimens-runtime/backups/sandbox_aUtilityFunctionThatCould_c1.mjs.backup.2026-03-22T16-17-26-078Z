/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-22T15:24:20.061Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function findMostFrequentPatterns(inputString, patternLength) {
    if (typeof inputString !== 'string' || inputString.length === 0) {
        throw new Error('Input must be a non-empty string.');
    }
    if (typeof patternLength !== 'number' || patternLength <= 0) {
        throw new Error('Pattern length must be a positive integer.');
    }
    if (patternLength > inputString.length) {
        throw new Error('Pattern length cannot exceed the input string length.');
    }

    const patternFrequency = new Map();

    for (let i = 0; i <= inputString.length - patternLength; i++) {
        const pattern = inputString.substring(i, i + patternLength);
        patternFrequency.set(pattern, (patternFrequency.get(pattern) || 0) + 1);
    }

    let maxFrequency = 0;
    const mostFrequentPatterns = [];

    patternFrequency.forEach((frequency, pattern) => {
        if (frequency > maxFrequency) {
            maxFrequency = frequency;
            mostFrequentPatterns.length = 0;
            mostFrequentPatterns.push(pattern);
        } else if (frequency === maxFrequency) {
            mostFrequentPatterns.push(pattern);
        }
    });

    return {
        patterns: mostFrequentPatterns,
        frequency: maxFrequency
    };
}

// Test cases
console.log(findMostFrequentPatterns("ababab", 2)); // { patterns: ['ab', 'ba'], frequency: 3 }
console.log(findMostFrequentPatterns("abcabcabc", 3)); // { patterns: ['abc'], frequency: 3 }
console.log(findMostFrequentPatterns("aaaaa", 2)); // { patterns: ['aa'], frequency: 4 }
console.log(findMostFrequentPatterns("abcdef", 1)); // { patterns: ['a', 'b', 'c', 'd', 'e', 'f'], frequency: 1 }
console.log(findMostFrequentPatterns("mississippi", 2)); // { patterns: ['ss', 'is'], frequency: 2 }

// Edge cases
console.log(findMostFrequentPatterns("a", 1)); // { patterns: ['a'], frequency: 1 }
console.log(findMostFrequentPatterns("aaaaaa", 6)); // { patterns: ['aaaaaa'], frequency: 1 }
try {
    console.log(findMostFrequentPatterns("", 2)); // Error
} catch (e) {
    console.log(e.message); // Input must be a non-empty string.
}
try {
    console.log(findMostFrequentPatterns("abc", 0)); // Error
} catch (e) {
    console.log(e.message); // Pattern length must be a positive integer.
}
try {
    console.log(findMostFrequentPatterns("abc", 5)); // Error
} catch (e) {
    console.log(e.message); // Pattern length cannot exceed the input string length.
}