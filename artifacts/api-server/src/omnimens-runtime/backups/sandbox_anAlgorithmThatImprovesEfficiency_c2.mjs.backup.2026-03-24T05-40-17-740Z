/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: an algorithm that improves efficiency of knowledge retrieval or pattern recognit
 * Written: 2026-03-24T04:47:50.240Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function KnowledgeGraph() {
    this.graph = new Map();
}

// Adds a concept and its related concepts to the graph
KnowledgeGraph.prototype.addConcept = function (concept, relatedConcepts) {
    if (!this.graph.has(concept)) {
        this.graph.set(concept, new Set());
    }
    for (let related of relatedConcepts) {
        this.graph.get(concept).add(related);
        if (!this.graph.has(related)) {
            this.graph.set(related, new Set());
        }
        this.graph.get(related).add(concept);
    }
};

// Retrieves related concepts with a depth-first search
KnowledgeGraph.prototype.retrieveRelatedConcepts = function (concept, depth) {
    if (!this.graph.has(concept)) {
        return [];
    }

    let visited = new Set();
    let results = new Set();

    function dfs(current, currentDepth) {
        if (currentDepth > depth || visited.has(current)) {
            return;
        }
        visited.add(current);
        results.add(current);
        for (let neighbor of this.graph.get(current)) {
            dfs.call(this, neighbor, currentDepth + 1);
        }
    }

    dfs.call(this, concept, 0);
    results.delete(concept); // Exclude the original concept
    return Array.from(results);
};

// Test cases
function runTests() {
    let kg = new KnowledgeGraph();

    // Adding concepts and relationships
    kg.addConcept("AI", ["Machine Learning", "Neural Networks", "Deep Learning"]);
    kg.addConcept("Machine Learning", ["Supervised Learning", "Unsupervised Learning"]);
    kg.addConcept("Neural Networks", ["Backpropagation", "Activation Functions"]);
    kg.addConcept("Deep Learning", ["Convolutional Networks", "Recurrent Networks"]);
    kg.addConcept("Supervised Learning", ["Classification", "Regression"]);
    kg.addConcept("Unsupervised Learning", ["Clustering", "Dimensionality Reduction"]);

    console.log("Test 1: Retrieve related concepts for 'AI' with depth 1");
    console.log(kg.retrieveRelatedConcepts("AI", 1)); // Expected: ["Machine Learning", "Neural Networks", "Deep Learning"]

    console.log("Test 2: Retrieve related concepts for 'AI' with depth 2");
    console.log(kg.retrieveRelatedConcepts("AI", 2)); // Expected: ["Machine Learning", "Neural Networks", "Deep Learning", "Supervised Learning", "Unsupervised Learning", "Backpropagation", "Activation Functions", "Convolutional Networks", "Recurrent Networks"]

    console.log("Test 3: Retrieve related concepts for 'Machine Learning' with depth 1");
    console.log(kg.retrieveRelatedConcepts("Machine Learning", 1)); // Expected: ["AI", "Supervised Learning", "Unsupervised Learning"]

    console.log("Test 4: Retrieve related concepts for 'Supervised Learning' with depth 2");
    console.log(kg.retrieveRelatedConcepts("Supervised Learning", 2)); // Expected: ["Machine Learning", "AI", "Classification", "Regression", "Unsupervised Learning"]
}

runTests();