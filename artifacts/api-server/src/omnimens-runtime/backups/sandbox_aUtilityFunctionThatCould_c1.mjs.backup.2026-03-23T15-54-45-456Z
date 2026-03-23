/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-23T15:23:42.570Z
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
        const pattern = text.substring(i, i + patternLength);
        if (patternCounts.has(pattern)) {
            patternCounts.set(pattern, patternCounts.get(pattern) + 1);
        } else {
            patternCounts.set(pattern, 1);
        }
    }

    const sortedPatterns = Array.from(patternCounts.entries()).sort((a, b) => b[1] - a[1]);
    const mostFrequentPatterns = sortedPatterns.filter(([_, count]) => count === sortedPatterns[0][1]);

    return mostFrequentPatterns.map(([pattern, count]) => ({ pattern, count }));
}

// Test cases
console.log('Test Case 1:');
console.log(findMostFrequentPatterns('abababab', 2)); // Expected: [{ pattern: 'ab', count: 4 }, { pattern: 'ba', count: 3 }]

console.log('Test Case 2:');
console.log(findMostFrequentPatterns('abcdeabcdeabc', 3)); // Expected: [{ pattern: 'abc', count: 3 }, { pattern: 'bcd', count: 2 }, { pattern: 'cde', count: 2 }]

console.log('Test Case 3:');
console.log(findMostFrequentPatterns('aaaaaa', 2)); // Expected: [{ pattern: 'aa', count: 5 }]

console.log('Test Case 4:');
console.log(findMostFrequentPatterns('xyzxyzxyz', 3)); // Expected: [{ pattern: 'xyz', count: 3 }]

console.log('Test Case 5 (Edge Case: Single Character Text):');
console.log(findMostFrequentPatterns('a', 1)); // Expected: [{ pattern: 'a', count: 1 }]

console.log('Test Case 6 (Edge Case: Empty Text):');
console.log(findMostFrequentPatterns('', 1)); // Expected: []

console.log('Test Case 7 (Edge Case: Pattern Length Greater Than Text Length):');
console.log(findMostFrequentPatterns('abc', 5)); // Expected: []

console.log('Test Case 8 (Edge Case: Non-String Input):');
try {
    console.log(findMostFrequentPatterns(12345, 2));
} catch (e) {
    console.log(e.message); // Expected: Error message
}

console.log('Test Case 9 (Edge Case: Invalid Pattern Length):');
try {
    console.log(findMostFrequentPatterns('abcde', -1));
} catch (e) {
    console.log(e.message); // Expected: Error message
}