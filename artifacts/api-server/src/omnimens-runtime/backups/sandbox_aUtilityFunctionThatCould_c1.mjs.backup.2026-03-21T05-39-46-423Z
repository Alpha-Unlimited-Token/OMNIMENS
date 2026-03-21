/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-21T05:21:25.421Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function for finding the longest common subsequence (LCS) between two strings
function longestCommonSubsequence(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    // Populate the DP table
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
    let lcs = '';
    let i = m, j = n;
    while (i > 0 && j > 0) {
        if (str1[i - 1] === str2[j - 1]) {
            lcs = str1[i - 1] + lcs;
            i--;
            j--;
        } else if (dp[i - 1][j] > dp[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }

    return lcs;
}

// Test cases
function runTests() {
    console.log("Test 1:", longestCommonSubsequence("abcde", "ace") === "ace"); // Expected: "ace"
    console.log("Test 2:", longestCommonSubsequence("abc", "abc") === "abc"); // Expected: "abc"
    console.log("Test 3:", longestCommonSubsequence("abc", "def") === ""); // Expected: ""
    console.log("Test 4:", longestCommonSubsequence("AGGTAB", "GXTXAYB") === "GTAB"); // Expected: "GTAB"
    console.log("Test 5:", longestCommonSubsequence("", "abc") === ""); // Expected: ""
    console.log("Test 6:", longestCommonSubsequence("abc", "") === ""); // Expected: ""
    console.log("Test 7:", longestCommonSubsequence("abcdef", "abdf") === "abdf"); // Expected: "abdf"
    console.log("Test 8:", longestCommonSubsequence("aaaa", "aa") === "aa"); // Expected: "aa"
}

// Run tests
runTests();