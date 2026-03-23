/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-23T00:50:47.683Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
        throw new Error("Vectors must be of the same length.");
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magnitudeA += vecA[i] ** 2;
        magnitudeB += vecB[i] ** 2;
    }

    const magnitudeProduct = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
    if (magnitudeProduct === 0) {
        return 0; // Avoid division by zero
    }

    return dotProduct / magnitudeProduct;
}

// Self-tests
function runTests() {
    console.log("Running tests...");

    // Test 1: Identical vectors
    const vec1 = [1, 2, 3];
    const vec2 = [1, 2, 3];
    console.log("Test 1:", cosineSimilarity(vec1, vec2)); // Expected: 1

    // Test 2: Completely opposite vectors
    const vec3 = [1, 0, -1];
    const vec4 = [-1, 0, 1];
    console.log("Test 2:", cosineSimilarity(vec3, vec4)); // Expected: -1

    // Test 3: Orthogonal vectors
    const vec5 = [1, 0];
    const vec6 = [0, 1];
    console.log("Test 3:", cosineSimilarity(vec5, vec6)); // Expected: 0

    // Test 4: Zero vector
    const vec7 = [0, 0, 0];
    const vec8 = [1, 2, 3];
    console.log("Test 4:", cosineSimilarity(vec7, vec8)); // Expected: 0

    // Test 5: Different lengths (should throw error)
    try {
        const vec9 = [1, 2];
        const vec10 = [1, 2, 3];
        console.log("Test 5:", cosineSimilarity(vec9, vec10));
    } catch (e) {
        console.log("Test 5:", e.message); // Expected: Error message
    }

    console.log("Tests completed.");
}

// Execute tests
runTests();