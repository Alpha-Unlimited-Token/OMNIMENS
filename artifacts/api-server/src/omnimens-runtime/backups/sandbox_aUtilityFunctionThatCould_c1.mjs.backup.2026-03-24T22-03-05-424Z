/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-24T21:51:24.060Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function findPatternsInText(text, patterns) {
  if (typeof text !== 'string' || !Array.isArray(patterns)) {
    throw new Error('Invalid input: text must be a string and patterns must be an array of strings.');
  }

  const matches = patterns.map(pattern => {
    const regex = new RegExp(pattern, 'g');
    const match = text.match(regex);
    return { pattern, occurrences: match ? match.length : 0, matches: match || [] };
  });

  return matches;
}

// Tests
function runTests() {
  console.log("Test 1: Basic pattern matching");
  const text1 = "Artificial intelligence is reshaping industries. AI is everywhere.";
  const patterns1 = ["AI", "intelligence", "industries"];
  const result1 = findPatternsInText(text1, patterns1);
  console.log(result1);

  console.log("Test 2: No matches");
  const text2 = "This is a simple sentence.";
  const patterns2 = ["complex", "AI"];
  const result2 = findPatternsInText(text2, patterns2);
  console.log(result2);

  console.log("Test 3: Edge case - empty text");
  const text3 = "";
  const patterns3 = ["AI", "intelligence"];
  const result3 = findPatternsInText(text3, patterns3);
  console.log(result3);

  console.log("Test 4: Edge case - empty patterns");
  const text4 = "AI is evolving rapidly.";
  const patterns4 = [];
  const result4 = findPatternsInText(text4, patterns4);
  console.log(result4);

  console.log("Test 5: Invalid inputs");
  try {
    findPatternsInText(123, ["AI"]);
  } catch (error) {
    console.log(error.message);
  }
  try {
    findPatternsInText("AI is everywhere.", "AI");
  } catch (error) {
    console.log(error.message);
  }
}

runTests();