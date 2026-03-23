/**
 * @module contextSummarizer
 * @description Summarizes long conversations into compact representations using sliding-window summarization with attention-weighted scoring.
 */

/**
 * Calculates attention-weighted scores for tokens based on their relevance.
 * @param {Array<string>} tokens - Array of tokens from the conversation.
 * @param {Array<number>} attentionScores - Array of attention weights corresponding to each token.
 * @returns {Array<{token: string, score: number}>} - Array of tokens with their weighted scores.
 */
function calculateAttentionScores(tokens, attentionScores) {
  if (tokens.length !== attentionScores.length) {
    throw new Error("Tokens and attentionScores arrays must have the same length.");
  }

  return tokens.map((token, index) => ({
    token,
    score: attentionScores[index]
  }));
}

/**
 * Generates a compact summary of a conversation using sliding-window summarization.
 * @param {Array<string>} conversation - Array of tokens representing the full conversation.
 * @param {Array<number>} attentionScores - Array of attention weights corresponding to each token.
 * @param {number} windowSize - Number of tokens to include in each sliding window.
 * @param {number} summarySize - Desired number of tokens in the final summary.
 * @returns {Array<string>} - Array of tokens representing the summarized conversation.
 */
function summarizeConversation(conversation, attentionScores, windowSize, summarySize) {
  if (conversation.length !== attentionScores.length) {
    throw new Error("Conversation and attentionScores arrays must have the same length.");
  }

  if (windowSize <= 0 || summarySize <= 0) {
    throw new Error("windowSize and summarySize must be positive integers.");
  }

  const scoredTokens = calculateAttentionScores(conversation, attentionScores);

  // Sliding-window summarization
  const windows = [];
  for (let i = 0; i < scoredTokens.length; i += windowSize) {
    const window = scoredTokens.slice(i, i + windowSize);
    const averageScore = window.reduce((sum, tokenObj) => sum + tokenObj.score, 0) / window.length;
    windows.push({ tokens: window.map(tokenObj => tokenObj.token), averageScore });
  }

  // Sort windows by average score in descending order
  windows.sort((a, b) => b.averageScore - a.averageScore);

  // Select top windows and flatten tokens into a summary
  const summaryTokens = windows.slice(0, Math.ceil(summarySize / windowSize))
    .flatMap(window => window.tokens);

  return summaryTokens.slice(0, summarySize); // Ensure summarySize limit
}

/**
 * Exports the module functions.
 */
export {
  calculateAttentionScores,
  summarizeConversation
};