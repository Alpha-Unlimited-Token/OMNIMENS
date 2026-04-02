/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: reversibleTokenCompressor
 * Written: 2026-04-02T14:23:44.735Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// reversibleTokenCompressor.mjs

import { createHash } from 'crypto';

// Utility function to generate a Huffman tree
export function buildHuffmanTree(frequencies) {
  const nodes = Object.entries(frequencies).map(([char, freq]) => ({ char, freq, left: null, right: null }));

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const left = nodes.shift();
    const right = nodes.shift();
    nodes.push({ char: null, freq: left.freq + right.freq, left, right });
  }

  return nodes[0];
}

// Utility function to generate Huffman codes
export function generateHuffmanCodes(tree, prefix = "", codes = {}) {
  if (!tree.left && !tree.right) {
    codes[tree.char] = prefix;
  } else {
    if (tree.left) generateHuffmanCodes(tree.left, prefix + "0", codes);
    if (tree.right) generateHuffmanCodes(tree.right, prefix + "1", codes);
  }
  return codes;
}

// Compress a token sequence using Huffman coding
export function compressTokens(tokens) {
  const frequencies = tokens.reduce((freq, token) => {
    freq[token] = (freq[token] || 0) + 1;
    return freq;
  }, {});

  const tree = buildHuffmanTree(frequencies);
  const codes = generateHuffmanCodes(tree);

  const compressed = tokens.map(token => codes[token]).join("");
  const metadata = { tree, originalLength: tokens.length };

  return { compressed, metadata };
}

// Decompress a Huffman-coded sequence
export function decompressTokens(compressed, metadata) {
  const { tree, originalLength } = metadata;
  const tokens = [];
  let node = tree;

  for (const bit of compressed) {
    node = bit === "0" ? node.left : node.right;
    if (!node.left && !node.right) {
      tokens.push(node.char);
      node = tree;
    }
  }

  if (tokens.length !== originalLength) {
    throw new Error("Decompression failed: Token count mismatch");
  }

  return tokens;
}

// Hierarchical summarization utility
export function summarizeTokens(tokens, chunkSize = 10) {
  const chunks = [];
  for (let i = 0; i < tokens.length; i += chunkSize) {
    const chunk = tokens.slice(i, i + chunkSize);
    const hash = createHash('sha256').update(chunk.join(" ")).digest('hex');
    chunks.push(hash);
  }
  return chunks;
}

// Reversible encoding utility
export function reversibleEncode(tokens) {
  return tokens.map(token => Buffer.from(token).toString('base64'));
}

export function reversibleDecode(encodedTokens) {
  return encodedTokens.map(encoded => Buffer.from(encoded, 'base64').toString());
}

// Combined utility for long-context reasoning
export function compressAndSummarize(tokens) {
  const { compressed, metadata } = compressTokens(tokens);
  const summary = summarizeTokens(tokens);
  return { compressed, metadata, summary };
}

// Example usage (uncomment to test in Node.js)
// const tokens = ["apple", "banana", "apple", "cherry", "banana", "apple"];
// const { compressed, metadata } = compressTokens(tokens);
// const decompressed = decompressTokens(compressed, metadata);
// console.log(decompressed); // Should match original tokens