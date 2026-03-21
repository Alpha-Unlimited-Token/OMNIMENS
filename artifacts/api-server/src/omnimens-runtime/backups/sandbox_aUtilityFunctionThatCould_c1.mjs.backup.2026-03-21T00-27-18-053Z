/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-21T00:08:33.861Z
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

    // Build the LCS table
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    // Reconstruct the LCS from the table
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
function testLongestCommonSubsequence() {
    console.log(longestCommonSubsequence("AGGTAB", "GXTXAYB")); // Expected: "GTAB"
    console.log(longestCommonSubsequence("ABC", "AC"));         // Expected: "AC"
    console.log(longestCommonSubsequence("12345", "54321"));    // Expected: "1"
    console.log(longestCommonSubsequence("", "ABC"));           // Expected: ""
    console.log(longestCommonSubsequence("ABC", ""));           // Expected: ""
    console.log(longestCommonSubsequence("ABCDEF", "ABCDEF"));  // Expected: "ABCDEF"
    console.log(longestCommonSubsequence("XMJYAUZ", "MZJAWXU")); // Expected: "MJAU"
}

testLongestCommonSubsequence();