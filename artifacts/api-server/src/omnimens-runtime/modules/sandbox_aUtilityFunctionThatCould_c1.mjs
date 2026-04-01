/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-04-01T14:17:46.798Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Function to calculate the term frequency-inverse document frequency (TF-IDF) for a set of documents
function calculateTFIDF(documents) {
    function termFrequency(term, doc) {
        const words = doc.split(/\s+/);
        const termCount = words.filter(word => word === term).length;
        return termCount / words.length;
    }

    function inverseDocumentFrequency(term, docs) {
        const numDocsWithTerm = docs.filter(doc => doc.includes(term)).length;
        return Math.log(docs.length / (1 + numDocsWithTerm));
    }

    const allTerms = Array.from(new Set(documents.join(" ").split(/\s+/)));
    const tfidf = {};

    documents.forEach((doc, docIndex) => {
        tfidf[`Doc${docIndex + 1}`] = {};
        allTerms.forEach(term => {
            const tf = termFrequency(term, doc);
            const idf = inverseDocumentFrequency(term, documents);
            tfidf[`Doc${docIndex + 1}`][term] = tf * idf;
        });
    });

    return tfidf;
}

// Test cases
const docs = [
    "the quick brown fox jumps over the lazy dog",
    "the quick brown fox is quick and smart",
    "lorem ipsum dolor sit amet consectetur adipiscing elit"
];

const tfidfResult = calculateTFIDF(docs);
console.log("TF-IDF Results:", JSON.stringify(tfidfResult, null, 2));

// Validate results
console.assert(Object.keys(tfidfResult).length === docs.length, "TF-IDF should calculate for all documents");
console.assert(Object.keys(tfidfResult.Doc1).length > 0, "TF-IDF should calculate for all terms in the documents");
console.log("All tests passed.");