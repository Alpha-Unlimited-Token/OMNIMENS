/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_63
 * Name: multiAgentCollaboration
 * Purpose: Enables distributed cognition by allowing OMNIMENS instances to share state and collaborate in real time.
 * Description: Enables distributed cognition via shared memory, peer-to-peer communication, and consensus decision-making for multi-agent collaboration.
 * Migrated: 2026-04-02T14:08:14.869Z
 */

// multiAgentCollaboration.mjs

import { randomUUID } from 'crypto';

/**
 * Generate a unique identifier for agents or shared memory objects.
 */
export function generateUUID() {
  return randomUUID();
}

/**
 * Create a shared memory object for distributed state management.
 * @param {Object} initialState - The initial state of the shared memory.
 * @returns {Object} - Shared memory object with synchronization methods.
 */
export function createSharedMemory(initialState = {}) {
  const state = { ...initialState };
  const listeners = new Set();

  return {
    /**
     * Get the current state.
     * @returns {Object} - The current state.
     */
    getState() {
      return { ...state };
    },

    /**
     * Update the state and notify listeners.
     * @param {Object} newState - The new state to merge.
     */
    updateState(newState) {
      Object.assign(state, newState);
      listeners.forEach((listener) => listener({ ...state }));
    },

    /**
     * Subscribe to state changes.
     * @param {Function} callback - Callback to invoke on state updates.
     */
    subscribe(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    }
  };
}

/**
 * Establish a WebRTC peer-to-peer connection between agents.
 * @param {Object} signalingChannel - Simulated signaling channel for WebRTC.
 * @returns {Object} - Connection object with methods for communication.
 */
export function establishPeerConnection(signalingChannel) {
  const peers = new Map();

  return {
    /**
     * Add a peer connection.
     * @param {string} peerId - Unique identifier for the peer.
     * @param {Function} onMessage - Callback for incoming messages.
     */
    addPeer(peerId, onMessage) {
      peers.set(peerId, onMessage);
    },

    /**
     * Send a message to a specific peer.
     * @param {string} peerId - The recipient peer's ID.
     * @param {Object} message - The message to send.
     */
    sendMessage(peerId, message) {
      const peerCallback = peers.get(peerId);
      if (peerCallback) {
        peerCallback(message);
      }
    },

    /**
     * Broadcast a message to all peers.
     * @param {Object} message - The message to broadcast.
     */
    broadcastMessage(message) {
      peers.forEach((callback) => callback(message));
    }
  };
}

/**
 * Consensus mechanism for distributed decision-making.
 * @param {Array} proposals - Array of proposals to evaluate.
 * @param {Function} fitnessFunction - Function to evaluate proposal fitness.
 * @returns {Object} - The best proposal and its score.
 */
export function consensusDecision(proposals, fitnessFunction) {
  let bestProposal = null;
  let bestScore = -Infinity;

  for (const proposal of proposals) {
    const score = fitnessFunction(proposal);
    if (score > bestScore) {
      bestScore = score;
      bestProposal = proposal;
    }
  }

  return { bestProposal, bestScore };
}

/**
 * Utility: Evaluate proposal fitness using a weighted scoring system.
 * @param {Object} proposal - The proposal to evaluate.
 * @param {Object} weights - Weights for scoring criteria.
 * @returns {number} - The computed fitness score.
 */
export function evaluateProposalFitness(proposal, weights) {
  return Object.keys(weights).reduce((score, key) => {
    return score + (proposal[key] || 0) * weights[key];
  }, 0);
}

/**
 * Utility: Normalize an array of values to a range [0, 1].
 * @param {Array<number>} values - Array of numeric values.
 * @returns {Array<number>} - Normalized values.
 */
export function normalizeValues(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return values.map((value) => (value - min) / (max - min));
}
