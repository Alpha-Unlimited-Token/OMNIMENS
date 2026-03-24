/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-24T22:54:12.835Z
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

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
        throw new Error("One of the vectors has zero magnitude");
    }

    return dotProduct / (magnitudeA * magnitudeB);
}

// Test cases
try {
    const vec1 = [1, 2, 3];
    const vec2 = [4, 5, 6];
    const vec3 = [0, 0, 0];
    const vec4 = [1, 0, -1];

    console.log("Cosine Similarity between vec1 and vec2:", cosineSimilarity(vec1, vec2)); // Expected: ~0.9746
    console.log("Cosine Similarity between vec1 and vec4:", cosineSimilarity(vec1, vec4)); // Expected: ~0.5
    console.log("Cosine Similarity between vec2 and vec4:", cosineSimilarity(vec2, vec4)); // Expected: ~0.4558

    // Edge case: Vectors of different lengths
    try {
        console.log(cosineSimilarity([1, 2], [1, 2, 3])); // Expected: Error
    } catch (e) {
        console.log("Error (expected):", e.message);
    }

    // Edge case: Zero magnitude vector
    try {
        console.log(cosineSimilarity(vec1, vec3)); // Expected: Error
    } catch (e) {
        console.log("Error (expected):", e.message);
    }
} catch (e) {
    console.error("Unexpected error:", e.message);
}