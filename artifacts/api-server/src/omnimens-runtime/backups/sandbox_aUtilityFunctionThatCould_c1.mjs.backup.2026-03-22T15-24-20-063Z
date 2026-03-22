/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-22T15:04:54.425Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility Function: Find the Longest Common Subsequence (LCS) between two strings
function longestCommonSubsequence(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    // Build the DP table
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    // Backtrack to find the LCS
    let i = m, j = n;
    let lcs = [];
    while (i > 0 && j > 0) {
        if (str1[i - 1] === str2[j - 1]) {
            lcs.unshift(str1[i - 1]);
            i--;
            j--;
        } else if (dp[i - 1][j] > dp[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }

    return lcs.join('');
}

// Test cases
function runTests() {
    console.log("Test 1: ", longestCommonSubsequence("abcdef", "acdf") === "acdf"); // True
    console.log("Test 2: ", longestCommonSubsequence("12345", "135") === "135"); // True
    console.log("Test 3: ", longestCommonSubsequence("abc", "def") === ""); // True
    console.log("Test 4: ", longestCommonSubsequence("AGGTAB", "GXTXAYB") === "GTAB"); // True
    console.log("Test 5: ", longestCommonSubsequence("", "abc") === ""); // True
    console.log("Test 6: ", longestCommonSubsequence("abc", "") === ""); // True
    console.log("Test 7: ", longestCommonSubsequence("aaaa", "aa") === "aa"); // True
    console.log("Test 8: ", longestCommonSubsequence("abcdef", "abcdef") === "abcdef"); // True
}

// Run tests
runTests();