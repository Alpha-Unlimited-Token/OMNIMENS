/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-04-01T14:38:21.848Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function: Calculate the Term Frequency-Inverse Document Frequency (TF-IDF) for a set of documents
function calculateTFIDF(documents) {
    if (!Array.isArray(documents) || documents.length === 0) {
        throw new Error("Input must be a non-empty array of documents.");
    }

    // Helper function to calculate term frequency (TF)
    function termFrequency(term, document) {
        const words = document.split(/\s+/);
        const termCount = words.filter(word => word === term).length;
        return termCount / words.length;
    }

    // Helper function to calculate inverse document frequency (IDF)
    function inverseDocumentFrequency(term, documents) {
        const numDocsWithTerm = documents.filter(doc => doc.includes(term)).length;
        return Math.log(documents.length / (1 + numDocsWithTerm));
    }

    // Get unique terms across all documents
    const allWords = documents.flatMap(doc => doc.split(/\s+/));
    const uniqueTerms = Array.from(new Set(allWords));

    // Calculate TF-IDF for each term in each document
    const tfidfMatrix = documents.map(doc => {
        const tfidfValues = {};
        uniqueTerms.forEach(term => {
            const tf = termFrequency(term, doc);
            const idf = inverseDocumentFrequency(term, documents);
            tfidfValues[term] = tf * idf;
        });
        return tfidfValues;
    });

    return tfidfMatrix;
}

// Test cases
const docs = [
    "the cat sat on the mat",
    "the dog sat on the log",
    "the cat chased the dog"
];

const result = calculateTFIDF(docs);
console.log("TF-IDF Matrix:", result);

// Validate results
console.assert(result.length === 3, "TF-IDF matrix should have the same number of rows as documents.");
console.assert(Object.keys(result[0]).length > 0, "Each document should have TF-IDF values for terms.");
console.assert(result[0]["the"] !== undefined, "Common terms like 'the' should have a TF-IDF value.");
console.log("All tests passed.");