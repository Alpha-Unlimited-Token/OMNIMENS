/**
 * OMNIMENS Self-Authored Module
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-20T16:28:19.135Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 */

function findMostFrequentWords(text, topN) {
    if (typeof text !== 'string' || typeof topN !== 'number' || topN <= 0) {
        throw new Error('Invalid input: text must be a string and topN must be a positive number.');
    }

    // Normalize text: remove punctuation, convert to lowercase, and split into words
    const normalizedText = text.replace(/[^\w\s]/g, '').toLowerCase();
    const words = normalizedText.split(/\s+/);

    // Count word frequencies
    const wordCounts = {};
    for (let word of words) {
        if (word) {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
    }

    // Sort words by frequency and extract the top N words
    const sortedWords = Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN);

    // Convert to an array of objects for better readability
    return sortedWords.map(([word, count]) => ({ word, count }));
}

// Self-tests
const testCases = [
    {
        text: "The quick brown fox jumps over the lazy dog. The dog barked back at the fox.",
        topN: 3,
        expected: [
            { word: 'the', count: 4 },
            { word: 'fox', count: 2 },
            { word: 'dog', count: 2 }
        ]
    },
    {
        text: "Hello world! Hello universe! Hello everyone!",
        topN: 2,
        expected: [
            { word: 'hello', count: 3 },
            { word: 'world', count: 1 }
        ]
    },
    {
        text: "AI is the future. AI is everywhere.",
        topN: 1,
        expected: [
            { word: 'ai', count: 2 }
        ]
    },
    {
        text: "",
        topN: 3,
        expected: []
    },
    {
        text: "SingleWord",
        topN: 1,
        expected: [
            { word: 'singleword', count: 1 }
        ]
    }
];

// Run tests
for (let i = 0; i < testCases.length; i++) {
    const { text, topN, expected } = testCases[i];
    const result = findMostFrequentWords(text, topN);
    console.log(`Test Case ${i + 1}:`, JSON.stringify(result) === JSON.stringify(expected) ? 'Passed' : 'Failed');
}