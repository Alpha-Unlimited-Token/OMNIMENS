/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-22T03:50:25.328Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function levenshteinDistance(a, b) {
    const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) {
        matrix[i][0] = i;
    }
    for (let j = 0; j <= b.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1, // Deletion
                matrix[i][j - 1] + 1, // Insertion
                matrix[i - 1][j - 1] + cost // Substitution
            );
        }
    }

    return matrix[a.length][b.length];
}

// Test cases
console.log("Test Cases for Levenshtein Distance:");
console.log(levenshteinDistance("kitten", "sitting") === 3); // Expected: true
console.log(levenshteinDistance("flaw", "lawn") === 2); // Expected: true
console.log(levenshteinDistance("intention", "execution") === 5); // Expected: true
console.log(levenshteinDistance("", "test") === 4); // Expected: true
console.log(levenshteinDistance("same", "same") === 0); // Expected: true
console.log(levenshteinDistance("", "") === 0); // Expected: true
console.log(levenshteinDistance("abc", "def") === 3); // Expected: true
console.log(levenshteinDistance("a", "a") === 0); // Expected: true
console.log(levenshteinDistance("a", "b") === 1); // Expected: true

console.log("All test cases passed!");