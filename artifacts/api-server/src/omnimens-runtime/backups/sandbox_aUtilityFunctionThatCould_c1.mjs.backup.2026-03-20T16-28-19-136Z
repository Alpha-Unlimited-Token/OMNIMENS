/**
 * OMNIMENS Self-Authored Module
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-20T16:17:00.514Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 */

// Utility function: Find the most frequent patterns in a text
function findFrequentPatterns(text, minLength, maxLength, topN) {
    if (typeof text !== 'string' || text.length === 0) {
        throw new Error("Input text must be a non-empty string.");
    }
    if (minLength <= 0 || maxLength <= 0 || minLength > maxLength || topN <= 0) {
        throw new Error("Invalid parameters. Ensure minLength > 0, maxLength > 0, minLength <= maxLength, and topN > 0.");
    }

    const patternFrequency = new Map();

    for (let length = minLength; length <= maxLength; length++) {
        for (let i = 0; i <= text.length - length; i++) {
            const pattern = text.slice(i, i + length);
            patternFrequency.set(pattern, (patternFrequency.get(pattern) || 0) + 1);
        }
    }

    const sortedPatterns = Array.from(patternFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN);

    return sortedPatterns.map(([pattern, frequency]) => ({ pattern, frequency }));
}

// Self-tests
(function testFindFrequentPatterns() {
    console.log("Test 1: Basic functionality");
    const text1 = "abcabcabc";
    const result1 = findFrequentPatterns(text1, 2, 3, 3);
    console.log(result1); // Expected: [{pattern: 'abc', frequency: 3}, {pattern: 'ab', frequency: 3}, {pattern: 'bc', frequency: 3}]

    console.log("Test 2: Single character patterns");
    const text2 = "aaaaaa";
    const result2 = findFrequentPatterns(text2, 1, 1, 1);
    console.log(result2); // Expected: [{pattern: 'a', frequency: 6}]

    console.log("Test 3: Edge case - empty string");
    try {
        findFrequentPatterns("", 1, 2, 3);
    } catch (error) {
        console.log(error.message); // Expected: "Input text must be a non-empty string."
    }

    console.log("Test 4: Edge case - invalid parameters");
    try {
        findFrequentPatterns("test", 0, 2, 3);
    } catch (error) {
        console.log(error.message); // Expected: "Invalid parameters. Ensure minLength > 0, maxLength > 0, minLength <= maxLength, and topN > 0."
    }

    console.log("Test 5: Larger text");
    const text3 = "banana";
    const result3 = findFrequentPatterns(text3, 2, 3, 2);
    console.log(result3); // Expected: [{pattern: 'an', frequency: 2}, {pattern: 'na', frequency: 2}]
})();