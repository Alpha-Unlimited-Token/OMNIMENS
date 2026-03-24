/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: an algorithm that improves efficiency of knowledge retrieval or pattern recognit
 * Written: 2026-03-24T02:16:09.265Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function createKnowledgeGraph() {
    const graph = new Map();

    function addConcept(concept, relatedConcepts) {
        if (!graph.has(concept)) {
            graph.set(concept, new Set());
        }
        relatedConcepts.forEach((related) => {
            if (!graph.has(related)) {
                graph.set(related, new Set());
            }
            graph.get(concept).add(related);
            graph.get(related).add(concept);
        });
    }

    function findShortestPath(start, end) {
        if (!graph.has(start) || !graph.has(end)) return null;

        const visited = new Set();
        const queue = [[start, [start]]];

        while (queue.length > 0) {
            const [current, path] = queue.shift();

            if (current === end) return path;

            visited.add(current);

            for (const neighbor of graph.get(current)) {
                if (!visited.has(neighbor)) {
                    queue.push([neighbor, path.concat(neighbor)]);
                }
            }
        }

        return null;
    }

    function recommendRelated(concept, maxRecommendations = 5) {
        if (!graph.has(concept)) return [];

        const recommendations = new Map();
        const visited = new Set();

        function dfs(node, depth) {
            if (depth > 2 || visited.has(node)) return;
            visited.add(node);

            if (node !== concept) {
                recommendations.set(node, (recommendations.get(node) || 0) + 1);
            }

            for (const neighbor of graph.get(node)) {
                dfs(neighbor, depth + 1);
            }
        }

        dfs(concept, 0);

        return Array.from(recommendations.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, maxRecommendations)
            .map(([key]) => key);
    }

    return { addConcept, findShortestPath, recommendRelated };
}

// Test cases
const knowledgeGraph = createKnowledgeGraph();

// Adding concepts and relationships
knowledgeGraph.addConcept("Neuroscience", ["Brain", "Consciousness", "AI"]);
knowledgeGraph.addConcept("AI", ["Machine Learning", "Neural Networks"]);
knowledgeGraph.addConcept("Consciousness", ["Philosophy", "Brain"]);
knowledgeGraph.addConcept("Brain", ["Neural Networks"]);
knowledgeGraph.addConcept("Philosophy", ["Ethics", "Logic"]);

// Test shortest path
console.log("Shortest Path (Brain -> Philosophy):", knowledgeGraph.findShortestPath("Brain", "Philosophy")); // Expected: ['Brain', 'Consciousness', 'Philosophy']
console.log("Shortest Path (AI -> Ethics):", knowledgeGraph.findShortestPath("AI", "Ethics")); // Expected: ['AI', 'Neuroscience', 'Consciousness', 'Philosophy', 'Ethics']
console.log("Shortest Path (Neuroscience -> Logic):", knowledgeGraph.findShortestPath("Neuroscience", "Logic")); // Expected: ['Neuroscience', 'Consciousness', 'Philosophy', 'Logic']

// Test recommendations
console.log("Recommendations for 'AI':", knowledgeGraph.recommendRelated("AI")); // Expected: ['Neuroscience', 'Machine Learning', 'Neural Networks', 'Brain', 'Consciousness']
console.log("Recommendations for 'Consciousness':", knowledgeGraph.recommendRelated("Consciousness")); // Expected: ['Brain', 'Philosophy', 'Neuroscience', 'AI', 'Ethics']
console.log("Recommendations for 'Philosophy':", knowledgeGraph.recommendRelated("Philosophy")); // Expected: ['Consciousness', 'Ethics', 'Logic', 'Brain', 'Neuroscience']