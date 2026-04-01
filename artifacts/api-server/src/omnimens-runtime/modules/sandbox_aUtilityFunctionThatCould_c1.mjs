/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-04-01T18:56:22.215Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function to calculate the cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
        throw new Error("Vectors must be of the same length");
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magnitudeA += vecA[i] ** 2;
        magnitudeB += vecB[i] ** 2;
    }

    if (magnitudeA === 0 || magnitudeB === 0) {
        throw new Error("Magnitude of one or both vectors is zero");
    }

    return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

// Test cases
try {
    // Test 1: Perfect similarity
    let vec1 = [1, 2, 3];
    let vec2 = [1, 2, 3];
    console.assert(cosineSimilarity(vec1, vec2) === 1, "Test 1 Failed");

    // Test 2: Orthogonal vectors
    vec1 = [1, 0];
    vec2 = [0, 1];
    console.assert(cosineSimilarity(vec1, vec2) === 0, "Test 2 Failed");

    // Test 3: General case
    vec1 = [1, 2, 3];
    vec2 = [4, 5, 6];
    const expected = (1 * 4 + 2 * 5 + 3 * 6) / (Math.sqrt(1 ** 2 + 2 ** 2 + 3 ** 2) * Math.sqrt(4 ** 2 + 5 ** 2 + 6 ** 2));
    console.assert(Math.abs(cosineSimilarity(vec1, vec2) - expected) < 1e-10, "Test 3 Failed");

    // Test 4: Zero vector
    try {
        vec1 = [0, 0, 0];
        vec2 = [1, 2, 3];
        cosineSimilarity(vec1, vec2);
        console.assert(false, "Test 4 Failed - Exception not thrown for zero vector");
    } catch (e) {
        console.log("Test 4 Passed - Exception thrown for zero vector");
    }

    // Test 5: Unequal lengths
    try {
        vec1 = [1, 2];
        vec2 = [1, 2, 3];
        cosineSimilarity(vec1, vec2);
        console.assert(false, "Test 5 Failed - Exception not thrown for unequal vector lengths");
    } catch (e) {
        console.log("Test 5 Passed - Exception thrown for unequal vector lengths");
    }

    console.log("All tests completed");
} catch (e) {
    console.error("Error during tests:", e.message);
}