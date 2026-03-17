/**
 * @module semanticMemoryStore
 * @description A utility module for in-memory vector search using HNSW (Hierarchical Navigable Small World) for semantic retrieval and long-term memory.
 */

/**
 * SemanticMemoryStore class implementing HNSW-based approximate nearest neighbor (ANN) search.
 * This class provides methods to add vectors, search for nearest neighbors, and manage the memory store.
 */
class SemanticMemoryStore {
    /**
     * Creates an instance of SemanticMemoryStore.
     * @param {number} dimensions - The number of dimensions for the vectors.
     * @param {number} maxElements - Maximum number of elements the store can hold.
     * @param {number} efConstruction - Parameter controlling the accuracy/speed tradeoff during indexing (higher is more accurate).
     * @param {number} M - Parameter controlling the number of bi-directional links created for each element.
     */
    constructor(dimensions, maxElements = 10000, efConstruction = 200, M = 16) {
        if (!Number.isInteger(dimensions) || dimensions <= 0) {
            throw new Error("Dimensions must be a positive integer.");
        }

        this.dimensions = dimensions;
        this.maxElements = maxElements;
        this.efConstruction = efConstruction;
        this.M = M;
        this.store = new Map(); // Internal store for metadata and vectors.
        this.index = null; // Placeholder for the HNSW index.

        this._initializeIndex();
    }

    /**
     * Initializes the HNSW index.
     * @private
     */
    _initializeIndex() {
        // Mock implementation of HNSW index initialization.
        // Replace with a real HNSW algorithm implementation if needed.
        this.index = {
            addPoint: (vector, id) => {
                if (vector.length !== this.dimensions) {
                    throw new Error("Vector dimensions do not match the initialized dimensions.");
                }
                this.store.set(id, vector);
            },
            searchKNN: (queryVector, k) => {
                if (queryVector.length !== this.dimensions) {
                    throw new Error("Query vector dimensions do not match the initialized dimensions.");
                }
                const distances = Array.from(this.store.entries()).map(([id, vector]) => {
                    return { id, distance: this._euclideanDistance(queryVector, vector) };
                });
                distances.sort((a, b) => a.distance - b.distance);
                return distances.slice(0, k).map(entry => ({ id: entry.id, distance: entry.distance }));
            }
        };
    }

    /**
     * Adds a vector to the store.
     * @param {string} id - Unique identifier for the vector.
     * @param {number[]} vector - The vector to add.
     */
    addVector(id, vector) {
        if (this.store.has(id)) {
            throw new Error(`ID '${id}' already exists in the store.`);
        }
        this.index.addPoint(vector, id);
    }

    /**
     * Searches for the k nearest neighbors to the given query vector.
     * @param {number[]} queryVector - The query vector.
     * @param {number} k - The number of nearest neighbors to retrieve.
     * @returns {Array<{id: string, distance: number}>} - List of nearest neighbors with their distances.
     */
    search(queryVector, k) {
        if (!Number.isInteger(k) || k <= 0) {
            throw new Error("k must be a positive integer.");
        }
        return this.index.searchKNN(queryVector, k);
    }

    /**
     * Calculates the Euclidean distance between two vectors.
     * @private
     * @param {number[]} vectorA - The first vector.
     * @param {number[]} vectorB - The second vector.
     * @returns {number} - The Euclidean distance.
     */
    _euclideanDistance(vectorA, vectorB) {
        if (vectorA.length !== vectorB.length) {
            throw new Error("Vectors must have the same dimensions.");
        }
        return Math.sqrt(vectorA.reduce((sum, val, idx) => sum + Math.pow(val - vectorB[idx], 2), 0));
    }
}

export { SemanticMemoryStore };