/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: an algorithm that improves efficiency of knowledge retrieval or pattern recognit
 * Written: 2026-03-23T14:23:15.181Z
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
  this.nodes = new Map();
}

KnowledgeGraph.prototype.addConcept = function(concept, relatedConcepts) {
  if (!this.nodes.has(concept)) {
    this.nodes.set(concept, new Set());
  }
  for (let related of relatedConcepts) {
    if (!this.nodes.has(related)) {
      this.nodes.set(related, new Set());
    }
    this.nodes.get(concept).add(related);
    this.nodes.get(related).add(concept);
  }
};

KnowledgeGraph.prototype.findShortestPath = function(start, end) {
  if (!this.nodes.has(start) || !this.nodes.has(end)) {
    return null;
  }

  let visited = new Set();
  let queue = [[start, [start]]];

  while (queue.length > 0) {
    let [current, path] = queue.shift();

    if (current === end) {
      return path;
    }

    visited.add(current);

    for (let neighbor of this.nodes.get(current)) {
      if (!visited.has(neighbor)) {
        queue.push([neighbor, path.concat(neighbor)]);
      }
    }
  }

  return null;
};

KnowledgeGraph.prototype.findPatterns = function(pattern) {
  let matches = [];
  for (let concept of this.nodes.keys()) {
    if (concept.includes(pattern)) {
      matches.push(concept);
    }
  }
  return matches;
};

// Self-tests
const graph = new KnowledgeGraph();

// Adding concepts and their relationships
graph.addConcept("AI", ["Machine Learning", "Neural Networks"]);
graph.addConcept("Machine Learning", ["Data Science", "Statistics"]);
graph.addConcept("Neural Networks", ["Deep Learning", "Backpropagation"]);
graph.addConcept("Data Science", ["Big Data", "Visualization"]);
graph.addConcept("Statistics", ["Probability", "Analysis"]);
graph.addConcept("Deep Learning", ["TensorFlow", "PyTorch"]);
graph.addConcept("Backpropagation", ["Optimization"]);
graph.addConcept("Big Data", ["Hadoop", "Spark"]);

console.log("Shortest Path (AI to Spark):", graph.findShortestPath("AI", "Spark"));
console.log("Shortest Path (Deep Learning to Probability):", graph.findShortestPath("Deep Learning", "Probability"));
console.log("Pattern Match ('Data'):", graph.findPatterns("Data"));
console.log("Pattern Match ('Learning'):", graph.findPatterns("Learning"));
console.log("Edge Case (Non-existent concept):", graph.findShortestPath("AI", "Quantum Computing"));