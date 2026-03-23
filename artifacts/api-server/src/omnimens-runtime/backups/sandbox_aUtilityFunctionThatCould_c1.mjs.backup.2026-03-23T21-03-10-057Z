/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-23T20:43:07.525Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function findMostFrequentPatterns(text, minLength, maxLength, topN) {
    if (typeof text !== 'string' || typeof minLength !== 'number' || typeof maxLength !== 'number' || typeof topN !== 'number') {
        throw new Error('Invalid input types');
    }
    if (minLength < 1 || maxLength < minLength || topN < 1) {
        throw new Error('Invalid input values');
    }

    const frequencyMap = new Map();

    for (let i = 0; i < text.length; i++) {
        for (let j = minLength; j <= maxLength; j++) {
            if (i + j <= text.length) {
                const substring = text.slice(i, i + j);
                frequencyMap.set(substring, (frequencyMap.get(substring) || 0) + 1);
            }
        }
    }

    const sortedPatterns = Array.from(frequencyMap.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, topN);

    return sortedPatterns.map(([pattern, frequency]) => ({ pattern, frequency }));
}

// Self-tests
console.log('Test Case 1:');
console.log(findMostFrequentPatterns('abababab', 2, 3, 3));
// Expected output: Most frequent patterns of length 2-3, e.g., [{ pattern: 'ab', frequency: 4 }, ...]

console.log('Test Case 2:');
console.log(findMostFrequentPatterns('abcabcabc', 1, 2, 5));
// Expected output: Top 5 frequent patterns, e.g., [{ pattern: 'a', frequency: 3 }, ...]

console.log('Test Case 3:');
console.log(findMostFrequentPatterns('aaaaa', 1, 3, 3));
// Expected output: [{ pattern: 'a', frequency: 5 }, { pattern: 'aa', frequency: 4 }, ...]

console.log('Test Case 4: Edge case with no patterns:');
console.log(findMostFrequentPatterns('', 1, 3, 3));
// Expected output: []

console.log('Test Case 5: Edge case with invalid inputs:');
try {
    console.log(findMostFrequentPatterns(12345, 1, 3, 3));
} catch (e) {
    console.log(e.message);
}
// Expected output: Error message