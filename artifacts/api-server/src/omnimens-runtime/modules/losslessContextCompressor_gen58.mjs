/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: losslessContextCompressor
 * Written: 2026-04-02T15:32:59.499Z
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
 * Encodes a sequence of tokens using Byte Pair Encoding (BPE).
 * @param {string[]} tokens - Array of tokens to encode.
 * @returns {Object} - Encoded result containing the compressed tokens and the mapping.
 */
export function encodeBPE(tokens) {
    const frequencyMap = tokens.reduce((freq, token) => {
        freq[token] = (freq[token] || 0) + 1;
        return freq;
    }, {});

    const pairs = Object.entries(frequencyMap).sort((a, b) => b[1] - a[1]);
    const mapping = {};
    let encodedTokens = tokens.slice();

    pairs.forEach(([pair, _]) => {
        const hash = createHash('md5').update(pair).digest('hex').slice(0, 8);
        mapping[hash] = pair;
        encodedTokens = encodedTokens.map(token => token === pair ? hash : token);
    });

    return { encodedTokens, mapping };
}

/**
 * Decodes a sequence of tokens using the provided BPE mapping.
 * @param {string[]} encodedTokens - Array of encoded tokens.
 * @param {Object} mapping - Mapping used for decoding.
 * @returns {string[]} - Decoded tokens.
 */
export function decodeBPE(encodedTokens, mapping) {
    return encodedTokens.map(token => mapping[token] || token);
}

/**
 * Encodes a sequence of tokens using Huffman coding.
 * @param {string[]} tokens - Array of tokens to encode.
 * @returns {Object} - Encoded result containing the compressed tokens and the tree.
 */
export function encodeHuffman(tokens) {
    const frequencyMap = tokens.reduce((freq, token) => {
        freq[token] = (freq[token] || 0) + 1;
        return freq;
    }, {});

    const nodes = Object.entries(frequencyMap).map(([token, freq]) => ({ token, freq }));

    while (nodes.length > 1) {
        nodes.sort((a, b) => a.freq - b.freq);
        const [left, right] = nodes.splice(0, 2);
        nodes.push({
            token: null,
            freq: left.freq + right.freq,
            left,
            right
        });
    }

    const tree = nodes[0];
    const mapping = {};

    function buildMapping(node, prefix = '') {
        if (node.token !== null) {
            mapping[node.token] = prefix;
        } else {
            buildMapping(node.left, prefix + '0');
            buildMapping(node.right, prefix + '1');
        }
    }

    buildMapping(tree);

    const encodedTokens = tokens.map(token => mapping[token]);
    return { encodedTokens, tree };
}

/**
 * Decodes a sequence of tokens using the provided Huffman tree.
 * @param {string[]} encodedTokens - Array of encoded tokens.
 * @param {Object} tree - Huffman tree used for decoding.
 * @returns {string[]} - Decoded tokens.
 */
export function decodeHuffman(encodedTokens, tree) {
    const decodedTokens = [];
    let node = tree;

    encodedTokens.forEach(bitString => {
        for (const bit of bitString) {
            node = bit === '0' ? node.left : node.right;
            if (node.token !== null) {
                decodedTokens.push(node.token);
                node = tree;
            }
        }
    });

    return decodedTokens;
}

/**
 * General utility to compress and decompress token sequences using either BPE or Huffman.
 * @param {string[]} tokens - Array of tokens to process.
 * @param {string} method - Compression method ('bpe' or 'huffman').
 * @returns {Object} - Encoded and decoded results.
 */
export function compressAndDecompress(tokens, method = 'bpe') {
    let encoded, decoded;

    if (method === 'bpe') {
        const { encodedTokens, mapping } = encodeBPE(tokens);
        encoded = encodedTokens;
        decoded = decodeBPE(encodedTokens, mapping);
    } else if (method === 'huffman') {
        const { encodedTokens, tree } = encodeHuffman(tokens);
        encoded = encodedTokens;
        decoded = decodeHuffman(encodedTokens, tree);
    } else {
        throw new Error('Unsupported compression method. Use "bpe" or "huffman".');
    }

    return { encoded, decoded };
}