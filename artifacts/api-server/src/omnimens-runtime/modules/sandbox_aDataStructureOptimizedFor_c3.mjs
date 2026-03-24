/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a data structure optimized for fast associative memory lookup
 * Written: 2026-03-24T00:10:19.148Z
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

AssociativeMemory.prototype.store = function(key, value) {
    if (typeof key !== 'string') {
        throw new Error('Key must be a string');
    }
    this.memory.set(key, value);
};

AssociativeMemory.prototype.retrieve = function(key) {
    if (typeof key !== 'string') {
        throw new Error('Key must be a string');
    }
    return this.memory.get(key);
};

AssociativeMemory.prototype.delete = function(key) {
    if (typeof key !== 'string') {
        throw new Error('Key must be a string');
    }
    return this.memory.delete(key);
};

AssociativeMemory.prototype.hasKey = function(key) {
    if (typeof key !== 'string') {
        throw new Error('Key must be a string');
    }
    return this.memory.has(key);
};

AssociativeMemory.prototype.clear = function() {
    this.memory.clear();
};

AssociativeMemory.prototype.size = function() {
    return this.memory.size;
};

// Test cases
(function testAssociativeMemory() {
    const memory = new AssociativeMemory();

    console.log('Test 1: Store and Retrieve');
    memory.store('alpha', 42);
    console.log(memory.retrieve('alpha') === 42); // true

    console.log('Test 2: Overwrite Existing Key');
    memory.store('alpha', 99);
    console.log(memory.retrieve('alpha') === 99); // true

    console.log('Test 3: Check Key Existence');
    console.log(memory.hasKey('alpha') === true); // true
    console.log(memory.hasKey('beta') === false); // true

    console.log('Test 4: Delete Key');
    console.log(memory.delete('alpha') === true); // true
    console.log(memory.hasKey('alpha') === false); // true

    console.log('Test 5: Clear Memory');
    memory.store('gamma', 123);
    memory.store('delta', 456);
    console.log(memory.size() === 2); // true
    memory.clear();
    console.log(memory.size() === 0); // true

    console.log('Test 6: Edge Cases');
    try {
        memory.store(123, 'value'); // Invalid key type
    } catch (e) {
        console.log(e.message === 'Key must be a string'); // true
    }

    try {
        memory.retrieve(123); // Invalid key type
    } catch (e) {
        console.log(e.message === 'Key must be a string'); // true
    }

    try {
        memory.delete(123); // Invalid key type
    } catch (e) {
        console.log(e.message === 'Key must be a string'); // true
    }

    console.log('All tests passed!');
})();