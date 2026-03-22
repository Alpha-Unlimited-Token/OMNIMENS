/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-22T19:46:48.509Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function: Find the longest common subsequence (LCS) between two strings
function longestCommonSubsequence(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const dp = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    // Backtrack to find the LCS string
    let lcs = '';
    let i = len1, j = len2;
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
console.log("Test Case 1:", longestCommonSubsequence("AGGTAB", "GXTXAYB") === "GTAB"); // Expected: "GTAB"
console.log("Test Case 2:", longestCommonSubsequence("ABC", "AC") === "AC"); // Expected: "AC"
console.log("Test Case 3:", longestCommonSubsequence("12345", "54321") === "1"); // Expected: "1"
console.log("Test Case 4:", longestCommonSubsequence("", "ABC") === ""); // Expected: ""
console.log("Test Case 5:", longestCommonSubsequence("ABC", "") === ""); // Expected: ""
console.log("Test Case 6:", longestCommonSubsequence("ABCDE", "ABCDE") === "ABCDE"); // Expected: "ABCDE"
console.log("Test Case 7:", longestCommonSubsequence("XMJYAUZ", "MZJAWXU") === "MJAU"); // Expected: "MJAU"