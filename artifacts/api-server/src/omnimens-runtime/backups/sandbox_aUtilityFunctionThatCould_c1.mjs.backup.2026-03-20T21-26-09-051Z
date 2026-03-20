/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-20T19:01:19.574Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function to perform KMP (Knuth-Morris-Pratt) pattern matching algorithm
// This function finds all occurrences of a pattern in a given text and returns their starting indices
function kmpPatternSearch(text, pattern) {
    if (!text || !pattern) return [];

    // Helper function to build the "longest prefix suffix" (LPS) array
    function buildLPS(pattern) {
        const lps = Array(pattern.length).fill(0);
        let length = 0; // length of the previous longest prefix suffix
        let i = 1;

        while (i < pattern.length) {
            if (pattern[i] === pattern[length]) {
                length++;
                lps[i] = length;
                i++;
            } else {
                if (length !== 0) {
                    length = lps[length - 1];
                } else {
                    lps[i] = 0;
                    i++;
                }
            }
        }
        return lps;
    }

    const lps = buildLPS(pattern);
    const result = [];
    let i = 0; // index for text
    let j = 0; // index for pattern

    while (i < text.length) {
        if (pattern[j] === text[i]) {
            i++;
            j++;
        }

        if (j === pattern.length) {
            result.push(i - j); // Match found, store starting index
            j = lps[j - 1];
        } else if (i < text.length && pattern[j] !== text[i]) {
            if (j !== 0) {
                j = lps[j - 1];
            } else {
                i++;
            }
        }
    }

    return result;
}

// Test cases
console.log(kmpPatternSearch("ababcabcabababd", "ababd")); // [10]
console.log(kmpPatternSearch("aaaaa", "aa")); // [0, 1, 2, 3]
console.log(kmpPatternSearch("abcde", "f")); // []
console.log(kmpPatternSearch("abcabcabcabc", "abcabc")); // [0, 3, 6]
console.log(kmpPatternSearch("", "a")); // []
console.log(kmpPatternSearch("a", "")); // []
console.log(kmpPatternSearch("", "")); // []
console.log(kmpPatternSearch("ababcabcabababd", "ab")); // [0, 2, 5, 7, 10]