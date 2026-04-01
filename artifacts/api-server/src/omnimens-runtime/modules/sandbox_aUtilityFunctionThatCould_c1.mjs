/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-04-01T19:20:56.987Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Function to compute term frequency-inverse document frequency (TF-IDF) for text analysis
function computeTFIDF(documents) {
    if (!Array.isArray(documents) || documents.length === 0) {
        throw new Error("Input must be a non-empty array of documents.");
    }

    const termFrequency = {};
    const documentFrequency = {};
    const totalDocuments = documents.length;

    // Calculate term frequency (TF) and document frequency (DF)
    documents.forEach((doc, index) => {
        if (typeof doc !== "string") {
            throw new Error(`Document at index ${index} is not a string.`);
        }
        const terms = doc.toLowerCase().split(/\W+/).filter(Boolean);
        const uniqueTerms = new Set(terms);

        termFrequency[index] = {};
        terms.forEach(term => {
            termFrequency[index][term] = (termFrequency[index][term] || 0) + 1;
        });

        uniqueTerms.forEach(term => {
            documentFrequency[term] = (documentFrequency[term] || 0) + 1;
        });
    });

    // Calculate TF-IDF
    const tfidf = {};
    for (let docIndex in termFrequency) {
        tfidf[docIndex] = {};
        for (let term in termFrequency[docIndex]) {
            const tf = termFrequency[docIndex][term];
            const idf = Math.log(totalDocuments / (1 + documentFrequency[term]));
            tfidf[docIndex][term] = tf * idf;
        }
    }

    return tfidf;
}

// Test cases
const docs = [
    "The quick brown fox jumps over the lazy dog",
    "The quick brown fox",
    "The dog is lazy but the fox is quick"
];

// Expected: A TF-IDF representation of the documents
const tfidfResult = computeTFIDF(docs);
console.log("TF-IDF Result:", tfidfResult);

// Edge case: Empty array
try {
    computeTFIDF([]);
} catch (e) {
    console.assert(e.message === "Input must be a non-empty array of documents.", "Edge case failed: Empty array");
}

// Edge case: Non-string document
try {
    computeTFIDF([42]);
} catch (e) {
    console.assert(e.message === "Document at index 0 is not a string.", "Edge case failed: Non-string document");
}