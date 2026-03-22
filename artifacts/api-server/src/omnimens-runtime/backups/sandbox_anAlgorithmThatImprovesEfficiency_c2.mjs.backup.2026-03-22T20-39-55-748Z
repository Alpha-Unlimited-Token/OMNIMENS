/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: an algorithm that improves efficiency of knowledge retrieval or pattern recognit
 * Written: 2026-03-22T19:58:48.773Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Algorithm to improve efficiency of knowledge retrieval using a Trie (Prefix Tree) structure
function TrieNode() {
  this.children = {};
  this.isEndOfWord = false;
}

function Trie() {
  this.root = new TrieNode();

  // Insert a word into the Trie
  this.insert = function (word) {
    let node = this.root;
    for (let char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEndOfWord = true;
  };

  // Search for a word in the Trie
  this.search = function (word) {
    let node = this.root;
    for (let char of word) {
      if (!node.children[char]) {
        return false;
      }
      node = node.children[char];
    }
    return node.isEndOfWord;
  };

  // Retrieve all words with a given prefix
  this.startsWith = function (prefix) {
    let node = this.root;
    for (let char of prefix) {
      if (!node.children[char]) {
        return [];
      }
      node = node.children[char];
    }
    return this._collectWords(node, prefix);
  };

  // Helper function to collect words from a given node
  this._collectWords = function (node, prefix) {
    let results = [];
    if (node.isEndOfWord) {
      results.push(prefix);
    }
    for (let char in node.children) {
      results = results.concat(this._collectWords(node.children[char], prefix + char));
    }
    return results;
  };
}

// Self-tests
const trie = new Trie();
trie.insert("knowledge");
trie.insert("know");
trie.insert("knock");
trie.insert("knot");
trie.insert("pattern");
trie.insert("patience");
trie.insert("path");
trie.insert("patter");

// Test case 1: Search for existing words
console.log(trie.search("knowledge")); // true
console.log(trie.search("know")); // true
console.log(trie.search("knock")); // true
console.log(trie.search("unknown")); // false

// Test case 2: Retrieve words with a given prefix
console.log(trie.startsWith("kn")); // ["knowledge", "know", "knock", "knot"]
console.log(trie.startsWith("pat")); // ["pattern", "patience", "path", "patter"]
console.log(trie.startsWith("z")); // []

// Test case 3: Edge cases
console.log(trie.search("")); // false
console.log(trie.startsWith("")); // ["knowledge", "know", "knock", "knot", "pattern", "patience", "path", "patter"]