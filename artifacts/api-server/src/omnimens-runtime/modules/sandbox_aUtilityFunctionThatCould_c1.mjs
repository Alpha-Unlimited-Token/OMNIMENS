/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-04-01T17:53:58.001Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function: Text similarity using cosine similarity
function cosineSimilarity(vec1, vec2) {
    if (vec1.length !== vec2.length) {
        throw new Error("Vectors must be of the same length");
    }
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    for (let i = 0; i < vec1.length; i++) {
        dotProduct += vec1[i] * vec2[i];
        magnitudeA += vec1[i] ** 2;
        magnitudeB += vec2[i] ** 2;
    }
    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0; // Avoid division by zero
    }
    return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

// Helper function: Convert text to frequency vector
function textToFrequencyVector(text, vocabulary) {
    const vector = new Array(vocabulary.length).fill(0);
    const words = text.toLowerCase().split(/\W+/);
    for (let word of words) {
        const index = vocabulary.indexOf(word);
        if (index !== -1) {
            vector[index]++;
        }
    }
    return vector;
}

// Test cases
const vocabulary = ["ai", "system", "data", "processing", "pattern", "analysis", "optimization"];
const text1 = "AI system optimization and data processing";
const text2 = "Pattern analysis and data processing for AI systems";
const text3 = "Unrelated text with no matching words";

const vec1 = textToFrequencyVector(text1, vocabulary);
const vec2 = textToFrequencyVector(text2, vocabulary);
const vec3 = textToFrequencyVector(text3, vocabulary);

console.assert(vec1.length === vocabulary.length, "Vector length should match vocabulary size");
console.assert(vec2.length === vocabulary.length, "Vector length should match vocabulary size");
console.assert(vec3.length === vocabulary.length, "Vector length should match vocabulary size");

const similarity1 = cosineSimilarity(vec1, vec2);
const similarity2 = cosineSimilarity(vec1, vec3);

console.log("Similarity between text1 and text2:", similarity1); // Should be > 0
console.log("Similarity between text1 and text3:", similarity2); // Should be 0

console.assert(similarity1 > similarity2, "Text1 and Text2 should be more similar than Text1 and Text3");