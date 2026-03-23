/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: slidingWindowContextManager
 * Written: 2026-03-23T11:43:31.786Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * @module slidingWindowContextManager
 * @description Retains critical context from earlier tokens and dynamically summarizes conversation history for extended interactions.
 */

/**
 * Represents a sliding window context manager for retaining and summarizing conversation history.
 * Uses priority-based retention and summarization for efficient context handling.
 */

/**
 * @typedef {Object} ContextItem
 * @property {string} content - The content of the context item.
 * @property {number} priority - The priority of the context item (higher is more important).
 */

/**
 * @typedef {Object} SlidingWindowContext
 * @property {Array<ContextItem>} retained - The retained high-priority context items.
 * @property {string} summary - The summarized history of lower-priority context items.
 */

/**
 * Creates a new sliding window context manager.
 * @param {number} maxRetainedItems - Maximum number of high-priority items to retain.
 * @param {number} maxSummaryLength - Maximum character length for the summarized history.
 * @returns {Object} The context manager with methods to add context and retrieve the current state.
 */
export function createSlidingWindowContextManager(maxRetainedItems = 10, maxSummaryLength = 500) {
  const retained = []; // High-priority retained items
  let summary = ""; // Summarized lower-priority history

  /**
   * Adds a new context item to the manager.
   * @param {string} content - The content of the context item.
   * @param {number} priority - The priority of the context item (higher is more important).
   */
  function addContext(content, priority) {
    const newItem = { content, priority };

    // Insert into retained if priority is high enough
    if (retained.length < maxRetainedItems || priority > retained[retained.length - 1].priority) {
      retained.push(newItem);
      retained.sort((a, b) => b.priority - a.priority); // Sort by descending priority
      if (retained.length > maxRetainedItems) {
        const removed = retained.pop();
        summary = summarize(summary + " " + removed.content, maxSummaryLength);
      }
    } else {
      // Add to summary if not retained
      summary = summarize(summary + " " + content, maxSummaryLength);
    }
  }

  /**
   * Summarizes a given text to a maximum length using simple token-based truncation.
   * @param {string} text - The text to summarize.
   * @param {number} maxLength - The maximum allowed length of the summary.
   * @returns {string} The summarized text.
   */
  function summarize(text, maxLength) {
    if (text.length <= maxLength) return text;
    const tokens = text.split(" ");
    let result = "";
    for (const token of tokens) {
      if ((result + token).length > maxLength) break;
      result += (result ? " " : "") + token;
    }
    return result + "...";
  }

  /**
   * Retrieves the current context state.
   * @returns {SlidingWindowContext} The current retained items and summary.
   */
  function getContext() {
    return {
      retained: [...retained],
      summary
    };
  }

  return { addContext, getContext };
}

/**
 * Example usage:
 * const manager = createSlidingWindowContextManager(5, 200);
 * manager.addContext("This is a high-priority message.", 10);
 * manager.addContext("This is a low-priority message.", 1);
 * console.log(manager.getContext());
 */