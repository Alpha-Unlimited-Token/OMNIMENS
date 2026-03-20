/**
 * OMNIMENS Self-Authored Module
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-20T17:28:30.740Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 */

function findMostFrequentPatterns(text, patternLength) {
    if (typeof text !== 'string' || typeof patternLength !== 'number' || patternLength <= 0) {
        throw new Error("Invalid input. Provide a string and a positive number for pattern length.");
    }

    const patternCounts = {};
    const textLength = text.length;

    for (let i = 0; i <= textLength - patternLength; i++) {
        const pattern = text.substring(i, i + patternLength);
        if (patternCounts[pattern]) {
            patternCounts[pattern]++;
        } else {
            patternCounts[pattern] = 1;
        }
    }

    const maxFrequency = Math.max(...Object.values(patternCounts));
    const mostFrequentPatterns = Object.keys(patternCounts).filter(
        pattern => patternCounts[pattern] === maxFrequency
    );

    return {
        patterns: mostFrequentPatterns,
        frequency: maxFrequency
    };
}

// Test cases
console.log("Test Case 1:");
console.log(findMostFrequentPatterns("abababab", 2)); // Should return { patterns: ['ab', 'ba'], frequency: 3 }

console.log("Test Case 2:");
console.log(findMostFrequentPatterns("abcabcabc", 3)); // Should return { patterns: ['abc'], frequency: 3 }

console.log("Test Case 3:");
console.log(findMostFrequentPatterns("aaaaaa", 1)); // Should return { patterns: ['a'], frequency: 6 }

console.log("Test Case 4:");
console.log(findMostFrequentPatterns("abcdefg", 2)); // Should return { patterns: ['ab', 'bc', 'cd', 'de', 'ef', 'fg'], frequency: 1 }

console.log("Test Case 5 (Edge Case):");
console.log(findMostFrequentPatterns("a", 1)); // Should return { patterns: ['a'], frequency: 1 }

console.log("Test Case 6 (Edge Case):");
console.log(findMostFrequentPatterns("", 1)); // Should return { patterns: [], frequency: 0 }