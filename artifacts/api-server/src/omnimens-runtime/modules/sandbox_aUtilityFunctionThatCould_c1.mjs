/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-24T04:12:13.191Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function cosineSimilarity(vec1, vec2) {
    if (vec1.length !== vec2.length) {
        throw new Error("Vectors must have the same length");
    }

    let dotProduct = 0;
    let magnitudeVec1 = 0;
    let magnitudeVec2 = 0;

    for (let i = 0; i < vec1.length; i++) {
        dotProduct += vec1[i] * vec2[i];
        magnitudeVec1 += vec1[i] ** 2;
        magnitudeVec2 += vec2[i] ** 2;
    }

    magnitudeVec1 = Math.sqrt(magnitudeVec1);
    magnitudeVec2 = Math.sqrt(magnitudeVec2);

    if (magnitudeVec1 === 0 || magnitudeVec2 === 0) {
        return 0; // Handle edge case where one or both vectors are zero vectors
    }

    return dotProduct / (magnitudeVec1 * magnitudeVec2);
}

// Self-tests
function runTests() {
    console.log("Running tests...");

    // Test 1: Similar vectors
    const vecA1 = [1, 2, 3];
    const vecB1 = [1, 2, 3];
    console.log("Test 1:", cosineSimilarity(vecA1, vecB1) === 1);

    // Test 2: Orthogonal vectors
    const vecA2 = [1, 0, 0];
    const vecB2 = [0, 1, 0];
    console.log("Test 2:", cosineSimilarity(vecA2, vecB2) === 0);

    // Test 3: Opposite vectors
    const vecA3 = [1, 2, 3];
    const vecB3 = [-1, -2, -3];
    console.log("Test 3:", cosineSimilarity(vecA3, vecB3) === -1);

    // Test 4: Zero vector
    const vecA4 = [0, 0, 0];
    const vecB4 = [1, 2, 3];
    console.log("Test 4:", cosineSimilarity(vecA4, vecB4) === 0);

    // Test 5: Different lengths (should throw error)
    try {
        const vecA5 = [1, 2];
        const vecB5 = [1, 2, 3];
        cosineSimilarity(vecA5, vecB5);
        console.log("Test 5: Failed (no error thrown)");
    } catch (e) {
        console.log("Test 5: Passed (error thrown)");
    }

    console.log("Tests completed.");
}

runTests();