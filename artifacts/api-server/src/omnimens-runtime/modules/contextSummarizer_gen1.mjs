/**
 * @module contextSummarizer
 * @description Summarizes and compresses conversation context using embeddings and periodic summarization.
 */

/**
 * Generates embeddings for text using a simple hashing mechanism to simulate sentence transformers.
 * This avoids external dependencies while still providing a representation of text similarity.
 * @param {string} text - The input text to generate an embedding for.
 * @returns {number[]} - A fixed-size array representing the embedding.
 */
export function generateEmbedding(text) {
  const hash = Array(128).fill(0);
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    hash[i % hash.length] = (hash[i % hash.length] + charCode) % 256;
  }
  return hash;
}

/**
 * Summarizes a list of context strings by compressing their embeddings into a single representative embedding.
 * @param {string[]} contexts - An array of context strings to summarize.
 * @returns {string} - A summarized string representing the combined context.
 */
export function summarizeContext(contexts) {
  if (!Array.isArray(contexts) || contexts.length === 0) {
    throw new Error("contexts must be a non-empty array of strings");
  }

  const combinedEmbedding = Array(128).fill(0);

  contexts.forEach((context) => {
    const embedding = generateEmbedding(context);
    for (let i = 0; i < combinedEmbedding.length; i++) {
      combinedEmbedding[i] += embedding[i];
    }
  });

  // Normalize the combined embedding
  const normalizedEmbedding = combinedEmbedding.map((value) => Math.round(value / contexts.length));

  // Convert back to a summarized string
  return normalizedEmbedding.map((num) => String.fromCharCode((num % 95) + 32)).join("");
}

/**
 * Periodically compresses the context to ensure it stays within a manageable size.
 * @param {string[]} contextHistory - The history of context strings.
 * @param {number} maxSize - The maximum allowed size of the context history.
 * @returns {string[]} - The updated context history.
 */
export function compressContextHistory(contextHistory, maxSize) {
  if (!Array.isArray(contextHistory) || typeof maxSize !== "number" || maxSize <= 0) {
    throw new Error("Invalid inputs: contextHistory must be an array and maxSize must be a positive number");
  }

  while (contextHistory.length > maxSize) {
    const summary = summarizeContext(contextHistory.slice(0, 2));
    contextHistory = [summary, ...contextHistory.slice(2)];
  }

  return contextHistory;
}

/**
 * Example usage of the context summarizer module.
 */
export function exampleUsage() {
  const contextHistory = [
    "JavaScript performance optimization V8 engine techniques",
    "new graph algorithms computational intelligence implementation",
    "emerging programming paradigms functional reactive 2025",
    "zero-shot learning few-shot prompting advanced techniques"
  ];

  console.log("Original Context History:", contextHistory);

  const compressedHistory = compressContextHistory(contextHistory, 2);
  console.log("Compressed Context History:", compressedHistory);
}

// Uncomment to run the example usage
// exampleUsage();