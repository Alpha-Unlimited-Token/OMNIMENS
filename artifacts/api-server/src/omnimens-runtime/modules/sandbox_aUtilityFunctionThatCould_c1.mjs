/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-21T04:35:46.652Z
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
    const textLength = text.length;

    for (let i = 0; i <= textLength - patternLength; i++) {
        const pattern = text.substring(i, i + patternLength);
        patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
    }

    const maxCount = Math.max(...patternCounts.values());
    const mostFrequentPatterns = Array.from(patternCounts.entries())
        .filter(([_, count]) => count === maxCount)
        .map(([pattern]) => pattern);

    return {
        mostFrequentPatterns,
        maxCount
    };
}

// Test cases
console.log('Test Case 1:');
console.log(findMostFrequentPatterns('abababab', 2)); 
// Expected output: { mostFrequentPatterns: ['ab', 'ba'], maxCount: 4 }

console.log('Test Case 2:');
console.log(findMostFrequentPatterns('abcabcabc', 3)); 
// Expected output: { mostFrequentPatterns: ['abc'], maxCount: 3 }

console.log('Test Case 3:');
console.log(findMostFrequentPatterns('aaaaa', 1)); 
// Expected output: { mostFrequentPatterns: ['a'], maxCount: 5 }

console.log('Test Case 4:');
console.log(findMostFrequentPatterns('abcdef', 2)); 
// Expected output: { mostFrequentPatterns: ['ab', 'bc', 'cd', 'de', 'ef'], maxCount: 1 }

console.log('Test Case 5:');
console.log(findMostFrequentPatterns('aabbccddeeff', 2)); 
// Expected output: { mostFrequentPatterns: ['aa', 'bb', 'cc', 'dd', 'ee', 'ff'], maxCount: 1 }

console.log('Test Case 6 (Edge case - Empty string):');
console.log(findMostFrequentPatterns('', 2)); 
// Expected output: { mostFrequentPatterns: [], maxCount: 0 }

console.log('Test Case 7 (Edge case - patternLength larger than text):');
console.log(findMostFrequentPatterns('abc', 5)); 
// Expected output: { mostFrequentPatterns: [], maxCount: 0 }