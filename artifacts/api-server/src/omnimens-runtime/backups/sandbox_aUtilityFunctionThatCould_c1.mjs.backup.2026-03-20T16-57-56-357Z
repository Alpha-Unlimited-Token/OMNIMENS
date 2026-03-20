/**
 * OMNIMENS Self-Authored Module
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-20T16:50:49.609Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 */

function findMostFrequentPatterns(text, n) {
    if (typeof text !== 'string' || typeof n !== 'number' || n <= 0) {
        throw new Error('Invalid input: text must be a string and n must be a positive number.');
    }

    const words = text.toLowerCase().match(/\b\w+\b/g);
    if (!words) {
        return {};
    }

    const patterns = new Map();

    for (let i = 0; i <= words.length - n; i++) {
        const pattern = words.slice(i, i + n).join(' ');
        patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
    }

    const sortedPatterns = Array.from(patterns.entries()).sort((a, b) => b[1] - a[1]);

    const result = {};
    sortedPatterns.forEach(([pattern, count]) => {
        result[pattern] = count;
    });

    return result;
}

// Self-tests
console.log("Test 1: Single word patterns");
console.log(findMostFrequentPatterns("hello world hello world hello", 1));

console.log("Test 2: Two-word patterns");
console.log(findMostFrequentPatterns("hello world hello world hello", 2));

console.log("Test 3: Edge case - empty string");
console.log(findMostFrequentPatterns("", 2));

console.log("Test 4: Edge case - n larger than word count");
console.log(findMostFrequentPatterns("hello world", 5));

console.log("Test 5: Edge case - invalid inputs");
try {
    console.log(findMostFrequentPatterns(12345, 2));
} catch (e) {
    console.log(e.message);
}

try {
    console.log(findMostFrequentPatterns("hello world", -1));
} catch (e) {
    console.log(e.message);
}