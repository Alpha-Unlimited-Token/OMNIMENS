/**
 * @module contextSummarizer
 * @description Compresses earlier conversation context into a smaller representation using a sliding window summarization algorithm with attention-based weighting.
 */

/**
 * Compresses a large context into a summarized representation.
 * Uses a sliding window approach with attention weighting to prioritize key information.
 *
 * @param {string[]} contextArray - Array of context strings to be summarized.
 * @param {number} windowSize - Number of context entries to include in each sliding window.
 * @param {number} summaryLength - Desired number of summarized entries to return.
 * @returns {string[]} Summarized context array.
 */
export function summarizeContext(contextArray, windowSize, summaryLength) {
  if (!Array.isArray(contextArray) || contextArray.length === 0) {
    throw new Error('contextArray must be a non-empty array of strings.');
  }
  if (typeof windowSize !== 'number' || windowSize <= 0) {
    throw new Error('windowSize must be a positive number.');
  }
  if (typeof summaryLength !== 'number' || summaryLength <= 0) {
    throw new Error('summaryLength must be a positive number.');
  }

  // Step 1: Tokenize each context entry into words and compute attention scores.
  const tokenize = (text) => text.split(/\s+/);
  const computeAttentionScore = (text) => text.length; // Simple heuristic: longer entries get higher scores.

  const tokenizedContext = contextArray.map((entry) => ({
    text: entry,
    tokens: tokenize(entry),
    attentionScore: computeAttentionScore(entry),
  }));

  // Step 2: Apply a sliding window to aggregate attention scores.
  const slidingWindowScores = [];
  for (let i = 0; i <= tokenizedContext.length - windowSize; i++) {
    const window = tokenizedContext.slice(i, i + windowSize);
    const aggregatedScore = window.reduce((sum, entry) => sum + entry.attentionScore, 0);
    slidingWindowScores.push({
      startIndex: i,
      endIndex: i + windowSize - 1,
      aggregatedScore,
    });
  }

  // Step 3: Sort windows by aggregated attention scores (descending).
  slidingWindowScores.sort((a, b) => b.aggregatedScore - a.aggregatedScore);

  // Step 4: Select top windows and extract their context entries.
  const selectedWindows = slidingWindowScores.slice(0, summaryLength);
  const selectedIndices = new Set();
  selectedWindows.forEach((window) => {
    for (let i = window.startIndex; i <= window.endIndex; i++) {
      selectedIndices.add(i);
    }
  });

  // Step 5: Deduplicate and preserve order of selected entries.
  const summarizedContext = Array.from(selectedIndices)
    .sort((a, b) => a - b) // Sort indices to preserve original order.
    .map((index) => contextArray[index]);

  return summarizedContext;
}

/**
 * Example usage of the summarizeContext function.
 *
 * @example
 * const context = [
 *   'First context entry.',
 *   'Second context entry with more detail.',
 *   'Third entry is short.',
 *   'Fourth entry has significant information.',
 *   'Fifth entry is also important.',
 * ];
 * const summary = summarizeContext(context, 2, 3);
 * console.log(summary);
 */