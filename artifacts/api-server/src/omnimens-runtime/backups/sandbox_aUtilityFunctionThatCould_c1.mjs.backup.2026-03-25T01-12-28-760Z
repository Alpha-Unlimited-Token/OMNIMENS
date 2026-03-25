/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-25T00:31:07.139Z
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

    const patternCounts = new Map();

    for (let i = 0; i <= text.length - patternLength; i++) {
        const pattern = text.slice(i, i + patternLength);
        patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
    }

    const sortedPatterns = Array.from(patternCounts.entries()).sort((a, b) => b[1] - a[1]);

    return sortedPatterns.slice(0, 5).map(([pattern, count]) => ({ pattern, count }));
}

// Test cases
console.log('Test Case 1:');
console.log(findMostFrequentPatterns('abababababab', 2)); // Expected: [{ pattern: 'ab', count: 6 }, { pattern: 'ba', count: 5 }]

console.log('Test Case 2:');
console.log(findMostFrequentPatterns('abcabcabcabc', 3)); // Expected: [{ pattern: 'abc', count: 4 }]

console.log('Test Case 3:');
console.log(findMostFrequentPatterns('aaaaaa', 1)); // Expected: [{ pattern: 'a', count: 6 }]

console.log('Test Case 4:');
console.log(findMostFrequentPatterns('abcdabcdabcdabcd', 4)); // Expected: [{ pattern: 'abcd', count: 4 }]

console.log('Test Case 5:');
console.log(findMostFrequentPatterns('xyzxyzxyzxyzxyz', 2)); // Expected: [{ pattern: 'xy', count: 5 }, { pattern: 'yz', count: 5 }, { pattern: 'zx', count: 4 }]