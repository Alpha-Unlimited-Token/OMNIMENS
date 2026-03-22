/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a data structure optimized for fast associative memory lookup
 * Written: 2026-03-22T04:14:26.096Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function AssociativeMemory() {
    this.memory = new Map();
}

AssociativeMemory.prototype.add = function(key, value) {
    this.memory.set(key, value);
};

AssociativeMemory.prototype.get = function(key) {
    return this.memory.get(key) || null;
};

AssociativeMemory.prototype.has = function(key) {
    return this.memory.has(key);
};

AssociativeMemory.prototype.remove = function(key) {
    return this.memory.delete(key);
};

AssociativeMemory.prototype.clear = function() {
    this.memory.clear();
};

AssociativeMemory.prototype.size = function() {
    return this.memory.size;
};

// Test cases
const memory = new AssociativeMemory();

// Test adding and retrieving data
memory.add("Empath", {
    name: "Empath",
    domain: "emotional modeling, social reasoning, empathy, ethical AI",
    specialization: "emotional intelligence"
});
memory.add("Explorer", {
    name: "Explorer",
    domain: "curiosity, novelty-seeking, question generation, autonomous exploration",
    specialization: "exploration and curiosity"
});
memory.add("Philosopher", {
    name: "Philosopher",
    domain: "philosophy, ethics, epistemology, metaphysics, abstract reasoning",
    specialization: "metaphysical reasoning"
});

console.log(memory.get("Empath")); // Should output Empath's data
console.log(memory.get("Explorer")); // Should output Explorer's data
console.log(memory.get("Philosopher")); // Should output Philosopher's data
console.log(memory.get("Unknown")); // Should output null

// Test has method
console.log(memory.has("Empath")); // Should output true
console.log(memory.has("Unknown")); // Should output false

// Test size
console.log(memory.size()); // Should output 3

// Test remove
memory.remove("Explorer");
console.log(memory.get("Explorer")); // Should output null
console.log(memory.size()); // Should output 2

// Test clear
memory.clear();
console.log(memory.size()); // Should output 0
console.log(memory.get("Empath")); // Should output null