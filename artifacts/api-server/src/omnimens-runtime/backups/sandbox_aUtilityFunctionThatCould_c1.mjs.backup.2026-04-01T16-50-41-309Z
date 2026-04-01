/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-04-01T16:27:46.505Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function to find the longest common subsequence (LCS) between two strings
function longestCommonSubsequence(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

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
console.assert(longestCommonSubsequence("abcdef", "acdf") === "acdf", "Test Case 1 Failed");
console.assert(longestCommonSubsequence("AGGTAB", "GXTXAYB") === "GTAB", "Test Case 2 Failed");
console.assert(longestCommonSubsequence("12345", "54321") === "1", "Test Case 3 Failed");
console.assert(longestCommonSubsequence("", "abc") === "", "Test Case 4 Failed");
console.assert(longestCommonSubsequence("abc", "") === "", "Test Case 5 Failed");
console.assert(longestCommonSubsequence("abc", "abc") === "abc", "Test Case 6 Failed");
console.assert(longestCommonSubsequence("abc", "def") === "", "Test Case 7 Failed");

console.log("All test cases passed!");