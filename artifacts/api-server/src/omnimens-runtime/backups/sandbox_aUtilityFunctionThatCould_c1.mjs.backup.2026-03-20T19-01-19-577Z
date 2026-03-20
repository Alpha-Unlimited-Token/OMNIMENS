/**
 * OMNIMENS Self-Authored Module
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-20T18:21:25.941Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 */

function levenshteinDistance(s1, s2) {
    // Compute the Levenshtein distance between two strings
    const len1 = s1.length;
    const len2 = s2.length;
    const dp = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) dp[i][0] = i;
    for (let j = 0; j <= len2; j++) dp[0][j] = j;

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
        }
    }

    return dp[len1][len2];
}

// Test cases
console.log("Test 1:", levenshteinDistance("kitten", "sitting") === 3); // Expected output: true
console.log("Test 2:", levenshteinDistance("flaw", "lawn") === 2); // Expected output: true
console.log("Test 3:", levenshteinDistance("", "abc") === 3); // Expected output: true
console.log("Test 4:", levenshteinDistance("abc", "") === 3); // Expected output: true
console.log("Test 5:", levenshteinDistance("same", "same") === 0); // Expected output: true
console.log("Test 6:", levenshteinDistance("distance", "editing") === 5); // Expected output: true