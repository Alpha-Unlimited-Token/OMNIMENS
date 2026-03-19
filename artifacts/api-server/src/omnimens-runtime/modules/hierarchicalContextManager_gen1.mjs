// hierarchicalContextManager.js

/**
 * @module hierarchicalContextManager
 * @description Maintains a compressed, hierarchical representation of long-term conversations by summarizing and storing older context in a tree structure.
 */

/**
 * Represents a node in the hierarchical context tree.
 * @typedef {Object} ContextNode
 * @property {string} summary - The summarized content of this node.
 * @property {Array<ContextNode>} children - The child nodes representing subcontexts.
 */

/**
 * Creates a new context node.
 * @param {string} summary - The summarized content for this node.
 * @returns {ContextNode} A new context node.
 */
function createContextNode(summary) {
  return {
    summary,
    children: []
  };
}

/**
 * Summarizes a list of text entries into a single summary.
 * This function simulates summarization using a naive approach.
 * @param {Array<string>} texts - The list of text entries to summarize.
 * @returns {string} A single summary combining the input texts.
 */
function summarizeTexts(texts) {
  if (!texts || texts.length === 0) return "";

  // Naive summarization: concatenate and truncate to 200 characters
  const combined = texts.join(" ");
  return combined.length > 200 ? combined.slice(0, 197) + "..." : combined;
}

/**
 * Adds a new context to the hierarchical tree, summarizing older contexts if needed.
 * @param {ContextNode} root - The root of the hierarchical context tree.
 * @param {string} newContext - The new context to add.
 * @returns {void}
 */
function addContext(root, newContext) {
  if (!root || typeof newContext !== "string") {
    throw new Error("Invalid input: root must be a ContextNode and newContext must be a string.");
  }

  // If the root has too many children, summarize them into a single node
  if (root.children.length >= 5) {
    const summaries = root.children.map(child => child.summary);
    const summarizedContent = summarizeTexts(summaries);
    const summarizedNode = createContextNode(summarizedContent);

    // Replace children with the summarized node
    root.children = [summarizedNode];
  }

  // Add the new context as a child node
  const newNode = createContextNode(newContext);
  root.children.push(newNode);
}

/**
 * Recursively retrieves the hierarchical context as a JSON object.
 * @param {ContextNode} node - The root node of the tree.
 * @returns {Object} A JSON representation of the hierarchical context.
 */
function getContextAsJSON(node) {
  if (!node) {
    throw new Error("Invalid input: node must be a ContextNode.");
  }

  return {
    summary: node.summary,
    children: node.children.map(getContextAsJSON)
  };
}

/**
 * Initializes a new hierarchical context tree.
 * @param {string} rootSummary - The summary for the root node.
 * @returns {ContextNode} The root of the new hierarchical context tree.
 */
function initializeContextTree(rootSummary) {
  return createContextNode(rootSummary);
}

// Export the module's functions
export {
  initializeContextTree,
  addContext,
  getContextAsJSON
};