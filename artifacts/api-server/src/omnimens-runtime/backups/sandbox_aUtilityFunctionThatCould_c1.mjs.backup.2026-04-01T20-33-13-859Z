/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-04-01T19:35:30.748Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Function to calculate the Levenshtein Distance between two strings
// This is useful for text analysis, pattern matching, and error correction
function levenshteinDistance(a, b) {
    if (a === b) return 0;

    const lenA = a.length;
    const lenB = b.length;

    // Create a 2D array to store distances
    const dp = Array(lenA + 1).fill(null).map(() => Array(lenB + 1).fill(0));

    // Initialize the first row and column
    for (let i = 0; i <= lenA; i++) dp[i][0] = i;
    for (let j = 0; j <= lenB; j++) dp[0][j] = j;

    // Fill the matrix
    for (let i = 1; i <= lenA; i++) {
        for (let j = 1; j <= lenB; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,      // Deletion
                dp[i][j - 1] + 1,      // Insertion
                dp[i - 1][j - 1] + cost // Substitution
            );
        }
    }

    return dp[lenA][lenB];
}

// Test cases
console.assert(levenshteinDistance("kitten", "sitting") === 3, "Test Case 1 Failed");
console.assert(levenshteinDistance("flaw", "lawn") === 2, "Test Case 2 Failed");
console.assert(levenshteinDistance("intention", "execution") === 5, "Test Case 3 Failed");
console.assert(levenshteinDistance("", "") === 0, "Test Case 4 Failed");
console.assert(levenshteinDistance("a", "") === 1, "Test Case 5 Failed");
console.assert(levenshteinDistance("", "a") === 1, "Test Case 6 Failed");
console.assert(levenshteinDistance("abc", "abc") === 0, "Test Case 7 Failed");
console.assert(levenshteinDistance("abc", "def") === 3, "Test Case 8 Failed");

console.log("All test cases passed!");