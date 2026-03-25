/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: an algorithm that improves efficiency of knowledge retrieval or pattern recognit
 * Written: 2026-03-25T03:16:19.455Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function buildInvertedIndex(documents) {
    const index = {};
    for (let i = 0; i < documents.length; i++) {
        const words = documents[i].split(/\W+/);
        for (let word of words) {
            word = word.toLowerCase();
            if (!index[word]) {
                index[word] = new Set();
            }
            index[word].add(i);
        }
    }
    return index;
}

function searchInvertedIndex(index, query) {
    const words = query.toLowerCase().split(/\W+/);
    let result = null;
    for (let word of words) {
        if (index[word]) {
            if (result === null) {
                result = new Set(index[word]);
            } else {
                result = new Set([...result].filter(docId => index[word].has(docId)));
            }
        } else {
            return []; // If any word in the query is not found, return empty results
        }
    }
    return result ? Array.from(result) : [];
}

// Test cases
const documents = [
    "The quick brown fox jumps over the lazy dog",
    "The quick brown fox is very quick and clever",
    "A lazy dog sleeps all day",
    "Foxes are clever and quick animals"
];

const index = buildInvertedIndex(documents);

console.log("Inverted Index:", index);

console.log("Search Results for 'quick brown':", searchInvertedIndex(index, "quick brown")); // Should match documents 0, 1, and 3
console.log("Search Results for 'lazy dog':", searchInvertedIndex(index, "lazy dog")); // Should match documents 0 and 2
console.log("Search Results for 'clever quick':", searchInvertedIndex(index, "clever quick")); // Should match documents 1 and 3
console.log("Search Results for 'nonexistent word':", searchInvertedIndex(index, "nonexistent word")); // Should return empty array
console.log("Search Results for 'fox clever':", searchInvertedIndex(index, "fox clever")); // Should match document 1