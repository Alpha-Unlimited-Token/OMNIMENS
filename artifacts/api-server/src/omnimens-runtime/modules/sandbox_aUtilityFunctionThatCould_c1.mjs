/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-24T13:05:05.007Z
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

  const results = patterns.map(pattern => {
    const regex = new RegExp(pattern, 'g');
    const matches = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      matches.push({ match: match[0], index: match.index });
    }

    return { pattern, matches };
  });

  return results;
}

// Self-tests
function runTests() {
  console.log('Running tests for findPatternsInText...');

  const text = 'The quick brown fox jumps over the lazy dog. The fox is clever.';
  const patterns = ['fox', 'dog', 'quick', 'clever'];

  const result = findPatternsInText(text, patterns);
  console.log('Test 1 - Basic functionality:');
  console.log(result);

  console.log('Test 2 - Edge case: Empty text');
  const emptyTextResult = findPatternsInText('', patterns);
  console.log(emptyTextResult);

  console.log('Test 3 - Edge case: No patterns');
  const noPatternsResult = findPatternsInText(text, []);
  console.log(noPatternsResult);

  console.log('Test 4 - Edge case: No matches');
  const noMatchesResult = findPatternsInText(text, ['cat', 'mouse']);
  console.log(noMatchesResult);

  console.log('Test 5 - Invalid input handling');
  try {
    findPatternsInText(null, patterns);
  } catch (error) {
    console.log(error.message);
  }

  try {
    findPatternsInText(text, null);
  } catch (error) {
    console.log(error.message);
  }

  console.log('All tests completed.');
}

runTests();