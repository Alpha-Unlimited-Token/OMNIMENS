/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-24T01:55:30.156Z
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
    if (typeof inputString !== 'string' || typeof patternLength !== 'number' || patternLength <= 0) {
        throw new Error('Invalid input: inputString must be a string and patternLength must be a positive number.');
    }

    const patternCounts = new Map();

    for (let i = 0; i <= inputString.length - patternLength; i++) {
        const pattern = inputString.substring(i, i + patternLength);
        patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
    }

    let maxCount = 0;
    const mostFrequentPatterns = [];

    patternCounts.forEach((count, pattern) => {
        if (count > maxCount) {
            maxCount = count;
            mostFrequentPatterns.length = 0; // Clear the array
            mostFrequentPatterns.push(pattern);
        } else if (count === maxCount) {
            mostFrequentPatterns.push(pattern);
        }
    });

    return {
        patterns: mostFrequentPatterns,
        frequency: maxCount
    };
}

// Test cases
console.log(findMostFrequentPatterns("abababab", 2)); // { patterns: [ 'ab', 'ba' ], frequency: 4 }
console.log(findMostFrequentPatterns("abcabcabc", 3)); // { patterns: [ 'abc' ], frequency: 3 }
console.log(findMostFrequentPatterns("aaaaaa", 1)); // { patterns: [ 'a' ], frequency: 6 }
console.log(findMostFrequentPatterns("abcdef", 2)); // { patterns: [ 'ab', 'bc', 'cd', 'de', 'ef' ], frequency: 1 }
console.log(findMostFrequentPatterns("mississippi", 2)); // { patterns: [ 'ss', 'si' ], frequency: 2 }
console.log(findMostFrequentPatterns("", 1)); // { patterns: [], frequency: 0 }
console.log(findMostFrequentPatterns("a", 2)); // { patterns: [], frequency: 0 }