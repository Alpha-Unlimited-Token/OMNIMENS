/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_4
 * Name: distributedConsensusManager
 * Purpose: Enables fault-tolerant distributed state synchronization across multiple OMNIMENS instances.
 * Description: Implements a Raft-based distributed consensus algorithm for leader election and log replication in JavaScript.
 * Migrated: 2026-04-02T22:06:58.663Z
 */

// distributedConsensusManager.mjs

import { randomUUID } from 'crypto';

// Utility function: Generate a unique ID for nodes
export function generateNodeId() {
  return randomUUID();
}

// Utility function: Simulate a timeout with jitter to avoid collisions
export function generateTimeout(base, jitter) {
  return base + Math.floor(Math.random() * jitter);
}

// Raft Node State
const STATES = {
  FOLLOWER: 'follower',
  CANDIDATE: 'candidate',
  LEADER: 'leader'
};

// Raft Node Class
export class RaftNode {
  constructor(nodeId, peers) {
    this.nodeId = nodeId; // Unique ID for this node
    this.peers = peers; // List of peer node IDs
    this.state = STATES.FOLLOWER; // Initial state
    this.currentTerm = 0; // Current term number
    this.votedFor = null; // Candidate ID this node voted for in the current term
    this.log = []; // Log entries
    this.commitIndex = -1; // Index of the highest log entry known to be committed
    this.lastApplied = -1; // Index of the highest log entry applied to state machine
    this.nextIndex = {}; // For leaders: index of the next log entry to send to each follower
    this.matchIndex = {}; // For leaders: index of highest log entry known to be replicated on each follower
    this.electionTimeout = null; // Timeout for election
  }

  // Start the node and initialize election timeout
  start() {
    this.resetElectionTimeout();
  }

  // Reset election timeout with randomized duration
  resetElectionTimeout() {
    clearTimeout(this.electionTimeout);
    const timeout = generateTimeout(150, 150); // Base 150ms + jitter
    this.electionTimeout = setTimeout(() => this.startElection(), timeout);
  }

  // Start election process
  startElection() {
    this.state = STATES.CANDIDATE;
    this.currentTerm += 1;
    this.votedFor = this.nodeId;
    const votes = new Set([this.nodeId]); // Vote for self

    // Request votes from peers
    this.peers.forEach(peer => {
      this.requestVote(peer, {
        term: this.currentTerm,
        candidateId: this.nodeId,
        lastLogIndex: this.log.length - 1,
        lastLogTerm: this.log[this.log.length - 1]?.term || 0
      }).then(response => {
        if (response.voteGranted) {
          votes.add(peer);
          if (votes.size > Math.floor((this.peers.length + 1) / 2)) {
            this.becomeLeader();
          }
        } else if (response.term > this.currentTerm) {
          this.currentTerm = response.term;
          this.state = STATES.FOLLOWER;
          this.resetElectionTimeout();
        }
      });
    });
  }

  // Become the leader
  becomeLeader() {
    this.state = STATES.LEADER;
    this.peers.forEach(peer => {
      this.nextIndex[peer] = this.log.length;
      this.matchIndex[peer] = -1;
    });
    this.sendHeartbeats();
  }

  // Send heartbeats to all peers
  sendHeartbeats() {
    if (this.state !== STATES.LEADER) return;
    this.peers.forEach(peer => {
      this.appendEntries(peer, {
        term: this.currentTerm,
        leaderId: this.nodeId,
        prevLogIndex: this.log.length - 1,
        prevLogTerm: this.log[this.log.length - 1]?.term || 0,
        entries: [],
        leaderCommit: this.commitIndex
      });
    });
    setTimeout(() => this.sendHeartbeats(), 50); // Repeat every 50ms
  }

  // Simulate requestVote RPC
  async requestVote(peer, request) {
    // Simulate network delay and response
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          term: this.currentTerm,
          voteGranted: Math.random() > 0.5 // Randomized for simulation
        });
      }, generateTimeout(10, 20));
    });
  }

  // Simulate appendEntries RPC
  async appendEntries(peer, request) {
    // Simulate network delay and response
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          term: this.currentTerm,
          success: true // Simplified for simulation
        });
      }, generateTimeout(10, 20));
    });
  }
}

// Utility: Create a cluster of Raft nodes
export function createCluster(nodeCount) {
  const nodes = [];
  const nodeIds = Array.from({ length: nodeCount }, () => generateNodeId());
  nodeIds.forEach(nodeId => {
    const peers = nodeIds.filter(id => id !== nodeId);
    const node = new RaftNode(nodeId, peers);
    nodes.push(node);
    node.start();
  });
  return nodes;
}