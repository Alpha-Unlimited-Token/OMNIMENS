/**
 * OMNIMENS Self-Authored Module
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-20T15:26:09.774Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 */

function extractHeadlinesByChannel(data, channel) {
  if (!Array.isArray(data)) {
    throw new Error("Input data must be an array.");
  }

  const headlines = data
    .filter((entry) => entry.channel && entry.channel.toLowerCase() === channel.toLowerCase())
    .map((entry) => entry.headline);

  return headlines;
}

// Self-tests
const testData = [
  { channel: "ai_frontier", headline: "OpenAI releases a new model capable of unsupervised learning." },
  { channel: "market", headline: "AI-driven companies see stock prices surge as investors flock." },
  { channel: "science", headline: "Breakthrough in CRISPR technology allows for precision editing." },
  { channel: "ai_frontier", headline: "New AI advancements promise better human-machine interaction." },
  { channel: "market", headline: "Tech stocks continue to rise amid growing AI adoption." },
];

// Test case 1: Extract headlines from "ai_frontier" channel
console.log(extractHeadlinesByChannel(testData, "ai_frontier"));
// Expected output: ["OpenAI releases a new model capable of unsupervised learning.", "New AI advancements promise better human-machine interaction."]

// Test case 2: Extract headlines from "market" channel
console.log(extractHeadlinesByChannel(testData, "market"));
// Expected output: ["AI-driven companies see stock prices surge as investors flock.", "Tech stocks continue to rise amid growing AI adoption."]

// Test case 3: Extract headlines from "science" channel
console.log(extractHeadlinesByChannel(testData, "science"));
// Expected output: ["Breakthrough in CRISPR technology allows for precision editing."]

// Test case 4: Extract headlines from a non-existent channel
console.log(extractHeadlinesByChannel(testData, "sports"));
// Expected output: []

// Test case 5: Handle invalid input
try {
  console.log(extractHeadlinesByChannel(null, "ai_frontier"));
} catch (error) {
  console.log(error.message);
}
// Expected output: "Input data must be an array."