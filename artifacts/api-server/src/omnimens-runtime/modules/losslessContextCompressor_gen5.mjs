/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: losslessContextCompressor
 * Written: 2026-04-02T21:54:09.689Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// losslessContextCompressor.mjs

import { createHash } from 'crypto';

/**
 * Builds a frequency table for characters in the input string.
 * @param {string} input - The input string to analyze.
 * @returns {Map<string, number>} - A map of characters to their frequencies.
 */
export function buildFrequencyTable(input) {
  const frequencyTable = new Map();
  for (const char of input) {
    frequencyTable.set(char, (frequencyTable.get(char) || 0) + 1);
  }
  return frequencyTable;
}

/**
 * Builds a Huffman tree from a frequency table.
 * @param {Map<string, number>} frequencyTable - A map of characters to their frequencies.
 * @returns {Object} - The root node of the Huffman tree.
 */
export function buildHuffmanTree(frequencyTable) {
  const nodes = Array.from(frequencyTable.entries()).map(([char, freq]) => ({ char, freq, left: null, right: null }));

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const left = nodes.shift();
    const right = nodes.shift();
    nodes.push({ char: null, freq: left.freq + right.freq, left, right });
  }

  return nodes[0];
}

/**
 * Generates a Huffman encoding map from a Huffman tree.
 * @param {Object} tree - The root node of the Huffman tree.
 * @returns {Map<string, string>} - A map of characters to their binary encodings.
 */
export function generateHuffmanEncodingMap(tree) {
  const encodingMap = new Map();

  function traverse(node, path) {
    if (!node.left && !node.right) {
      encodingMap.set(node.char, path);
      return;
    }
    if (node.left) traverse(node.left, path + '0');
    if (node.right) traverse(node.right, path + '1');
  }

  traverse(tree, '');
  return encodingMap;
}

/**
 * Encodes a string using Huffman encoding.
 * @param {string} input - The input string to encode.
 * @param {Map<string, string>} encodingMap - A map of characters to their binary encodings.
 * @returns {string} - The encoded binary string.
 */
export function encode(input, encodingMap) {
  return input.split('').map(char => encodingMap.get(char)).join('');
}

/**
 * Decodes a binary string using a Huffman tree.
 * @param {string} encoded - The binary string to decode.
 * @param {Object} tree - The root node of the Huffman tree.
 * @returns {string} - The decoded string.
 */
export function decode(encoded, tree) {
  let result = '';
  let node = tree;

  for (const bit of encoded) {
    node = bit === '0' ? node.left : node.right;
    if (!node.left && !node.right) {
      result += node.char;
      node = tree;
    }
  }

  return result;
}

/**
 * Generates a checksum for a string using SHA-256.
 * @param {string} input - The input string.
 * @returns {string} - The hexadecimal checksum.
 */
export function generateChecksum(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Compresses a string into a binary string and metadata for decompression.
 * @param {string} input - The input string to compress.
 * @returns {Object} - An object containing the compressed data, tree, and checksum.
 */
export function compress(input) {
  const frequencyTable = buildFrequencyTable(input);
  const tree = buildHuffmanTree(frequencyTable);
  const encodingMap = generateHuffmanEncodingMap(tree);
  const compressedData = encode(input, encodingMap);
  const checksum = generateChecksum(input);

  return { compressedData, tree, checksum };
}

/**
 * Decompresses a binary string using metadata and verifies integrity.
 * @param {Object} compressed - The compressed object containing data, tree, and checksum.
 * @returns {string} - The original string if checksum matches, otherwise throws an error.
 */
export function decompress({ compressedData, tree, checksum }) {
  const decompressedData = decode(compressedData, tree);
  const recalculatedChecksum = generateChecksum(decompressedData);

  if (recalculatedChecksum !== checksum) {
    throw new Error('Checksum mismatch: data integrity verification failed.');
  }

  return decompressedData;
}
