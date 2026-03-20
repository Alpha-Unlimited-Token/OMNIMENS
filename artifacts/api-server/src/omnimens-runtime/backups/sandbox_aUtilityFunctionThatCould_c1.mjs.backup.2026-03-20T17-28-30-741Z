/**
 * OMNIMENS Self-Authored Module
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-20T17:14:03.059Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 */

function levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;

    const dp = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) dp[i][0] = i;
    for (let j = 0; j <= len2; j++) dp[0][j] = j;

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
            }
        }
    }

    return dp[len1][len2];
}

// Test cases
console.log(levenshteinDistance("kitten", "sitting")); // Expected: 3
console.log(levenshteinDistance("flaw", "lawn")); // Expected: 2
console.log(levenshteinDistance("intention", "execution")); // Expected: 5
console.log(levenshteinDistance("", "")); // Expected: 0
console.log(levenshteinDistance("a", "")); // Expected: 1
console.log(levenshteinDistance("", "a")); // Expected: 1
console.log(levenshteinDistance("same", "same")); // Expected: 0
console.log(levenshteinDistance("abc", "def")); // Expected: 3
console.log(levenshteinDistance("distance", "editing")); // Expected: 5