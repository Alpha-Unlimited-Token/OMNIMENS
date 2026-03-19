// semanticMemoryManager.js

/**
 * @module semanticMemoryManager
 * @description A utility module for maintaining conversational context by summarizing earlier conversation segments and storing them for long-term memory.
 */

const { writeFile, readFile } = require('fs/promises');
const path = require('path');

/**
 * @typedef {Object} ConversationSegment
 * @property {number} id - Unique identifier for the segment.
 * @property {string} content - Original conversation text.
 */

/**
 * @typedef {Object} Summary
 * @property {number} id - Unique identifier for the summarized segment.
 * @property {string} summary - Condensed version of the conversation segment.
 */

const MEMORY_FILE = path.resolve(__dirname, 'semanticMemory.json');
const SLIDING_WINDOW_SIZE = 5; // Number of recent segments to keep in active memory.

/**
 * Initializes the semantic memory storage file if not already present.
 * @returns {Promise<void>} Resolves when initialization is complete.
 */
async function initializeMemory() {
  try {
    await readFile(MEMORY_FILE);
  } catch {
    await writeFile(MEMORY_FILE, JSON.stringify({ activeMemory: [], longTermMemory: [] }, null, 2));
  }
}

/**
 * Loads the current state of semantic memory from the storage file.
 * @returns {Promise<{ activeMemory: ConversationSegment[], longTermMemory: Summary[] }>} Memory state.
 */
async function loadMemory() {
  const data = await readFile(MEMORY_FILE, 'utf-8');
  return JSON.parse(data);
}

/**
 * Saves the updated state of semantic memory to the storage file.
 * @param {{ activeMemory: ConversationSegment[], longTermMemory: Summary[] }} memoryState Updated memory state.
 * @returns {Promise<void>} Resolves when saving is complete.
 */
async function saveMemory(memoryState) {
  await writeFile(MEMORY_FILE, JSON.stringify(memoryState, null, 2));
}

/**
 * Summarizes a conversation segment using a basic algorithm.
 * @param {string} content Original conversation text.
 * @returns {string} Summarized version of the text.
 */
function summarize(content) {
  const sentences = content.split('. ');
  return sentences.slice(0, Math.ceil(sentences.length / 2)).join('. ') + (sentences.length > 1 ? '...' : '');
}

/**
 * Adds a new conversation segment to active memory and manages sliding window.
 * @param {string} content New conversation text.
 * @returns {Promise<void>} Resolves when the memory is updated.
 */
async function addConversationSegment(content) {
  const memoryState = await loadMemory();

  const newSegment = {
    id: Date.now(),
    content
  };

  memoryState.activeMemory.push(newSegment);

  if (memoryState.activeMemory.length > SLIDING_WINDOW_SIZE) {
    const [oldSegment] = memoryState.activeMemory.splice(0, 1);
    const summary = {
      id: oldSegment.id,
      summary: summarize(oldSegment.content)
    };
    memoryState.longTermMemory.push(summary);
  }

  await saveMemory(memoryState);
}

/**
 * Retrieves the current active memory.
 * @returns {Promise<ConversationSegment[]>} List of active conversation segments.
 */
async function getActiveMemory() {
  const memoryState = await loadMemory();
  return memoryState.activeMemory;
}

/**
 * Retrieves the long-term memory summaries.
 * @returns {Promise<Summary[]>} List of summarized conversation segments.
 */
async function getLongTermMemory() {
  const memoryState = await loadMemory();
  return memoryState.longTermMemory;
}

// Module exports
module.exports = {
  initializeMemory,
  addConversationSegment,
  getActiveMemory,
  getLongTermMemory
};