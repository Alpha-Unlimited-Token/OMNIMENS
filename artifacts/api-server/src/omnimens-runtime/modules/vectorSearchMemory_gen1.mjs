/**
 * @module vectorSearchMemory
 * @description A utility module implementing Hierarchical Navigable Small World (HNSW) for efficient similarity search on vector embeddings.
 */

/**
 * @typedef {Object} Node
 * @property {number[]} vector - The embedding vector associated with this node.
 * @property {number} id - Unique identifier for the node.
 * @property {Map<number, Node[]>} neighbors - A map of levels to arrays of neighboring nodes.
 */

/**
 * @typedef {Object} SearchResult
 * @property {number} id - The ID of the closest node.
 * @property {number} distance - The distance to the closest node.
 */

/**
 * Calculate the Euclidean distance between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} The Euclidean distance between the vectors.
 */
function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must be of the same dimension.");
  }
  return Math.sqrt(vectorA.reduce((sum, val, index) => sum + Math.pow(val - vectorB[index], 2), 0));
}

/**
 * Class representing the HNSW graph.
 */
class HNSW {
  constructor(maxLevel = 5, maxNeighbors = 10) {
    this.maxLevel = maxLevel;
    this.maxNeighbors = maxNeighbors;
    this.nodes = new Map();
    this.entryPoint = null;
  }

  /**
   * Add a new node to the graph.
   * @param {number[]} vector - The embedding vector.
   * @param {number} id - Unique identifier for the node.
   */
  addNode(vector, id) {
    const newNode = { vector, id, neighbors: new Map() };
    for (let level = 0; level <= this.maxLevel; level++) {
      newNode.neighbors.set(level, []);
    }

    if (this.entryPoint === null) {
      this.entryPoint = newNode;
    } else {
      this._connectNode(newNode);
    }

    this.nodes.set(id, newNode);
  }

  /**
   * Search for the closest node to a given vector.
   * @param {number[]} queryVector - The vector to search for.
   * @returns {SearchResult} The closest node and its distance.
   */
  search(queryVector) {
    if (!this.entryPoint) {
      throw new Error("Graph is empty.");
    }

    let closestNode = this.entryPoint;
    let closestDistance = euclideanDistance(queryVector, closestNode.vector);

    for (let level = this.maxLevel; level >= 0; level--) {
      let improved = true;
      while (improved) {
        improved = false;
        for (const neighbor of closestNode.neighbors.get(level)) {
          const distance = euclideanDistance(queryVector, neighbor.vector);
          if (distance < closestDistance) {
            closestNode = neighbor;
            closestDistance = distance;
            improved = true;
          }
        }
      }
    }

    return { id: closestNode.id, distance: closestDistance };
  }

  /**
   * Connect a new node to the graph.
   * @param {Node} newNode - The node to connect.
   * @*/
  _connectNode(newNode) {
    let currentNode = this.entryPoint;

    for (let level = this.maxLevel; level >= 0; level--) {
      let closestNode = currentNode;
      let closestDistance = euclideanDistance(newNode.vector, closestNode.vector);

      let improved = true;
      while (improved) {
        improved = false;
        for (const neighbor of closestNode.neighbors.get(level)) {
          const distance = euclideanDistance(newNode.vector, neighbor.vector);
          if (distance < closestDistance) {
            closestNode = neighbor;
            closestDistance = distance;
            improved = true;
          }
        }
      }

      closestNode.neighbors.get(level).push(newNode);
      newNode.neighbors.get(level).push(closestNode);

      if (closestNode.neighbors.get(level).length > this.maxNeighbors) {
        closestNode.neighbors.set(level, closestNode.neighbors.get(level).slice(0, this.maxNeighbors));
      }
    }
  }
}

/**
 * Exported functions.
 */
export { HNSW, euclideanDistance };