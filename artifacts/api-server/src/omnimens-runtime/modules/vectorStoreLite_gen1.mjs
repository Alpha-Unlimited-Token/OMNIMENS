/**
 * @module vectorStoreLite
 * @description A lightweight in-memory vector storage and retrieval utility using TypedArrays, optimized for fast cosine similarity-based searches.
 */

/**
 * Class representing a vector store for efficient embedding storage and retrieval.
 */
export class VectorStoreLite {
  /**
   * Initializes the vector store.
   * @param {number} dimension - The dimensionality of the embeddings.
   */
  constructor(dimension) {
    if (!Number.isInteger(dimension) || dimension <= 0) {
      throw new Error('Dimension must be a positive integer.');
    }

    this.dimension = dimension;
    this.vectors = new Float32Array(0); // TypedArray to store embeddings
    this.ids = []; // Array to store associated IDs
  }

  /**
   * Adds a new vector to the store.
   * @param {string} id - A unique identifier for the vector.
   * @param {number[]} vector - The embedding vector to store.
   * @throws Will throw an error if the vector's dimension does not match the store's dimension.
   */
  addVector(id, vector) {
    if (vector.length !== this.dimension) {
      throw new Error(`Vector must have ${this.dimension} dimensions.`);
    }

    // Append the new vector to the TypedArray
    const newVectors = new Float32Array(this.vectors.length + this.dimension);
    newVectors.set(this.vectors);
    newVectors.set(vector, this.vectors.length);
    this.vectors = newVectors;

    // Add the ID
    this.ids.push(id);
  }

  /**
   * Retrieves the closest vectors to a given query vector using cosine similarity.
   * @param {number[]} queryVector - The query vector.
   * @param {number} k - The number of closest vectors to retrieve.
   * @returns {Array<{id, similarity}>} An array of objects containing the IDs and similarities of the closest vectors.
   */
  retrieve(queryVector, k = 1) {
    if (queryVector.length !== this.dimension) {
      throw new Error(`Query vector must have ${this.dimension} dimensions.`);
    }

    if (!Number.isInteger(k) || k <= 0) {
      throw new Error('k must be a positive integer.');
    }

    const similarities = [];

    for (let i = 0; i < this.ids.length; i++) {
      const start = i * this.dimension;
      const end = start + this.dimension;
      const storedVector = this.vectors.subarray(start, end);

      const similarity = this._cosineSimilarity(queryVector, storedVector);
      similarities.push({ id: this.ids[i], similarity });
    }

    // Sort by similarity in descending order and return the top k results
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);
  }

  /**
   * Computes the cosine similarity between two vectors.
   * @* @param {number[]} vectorA - The first vector.
   * @param {Float32Array} vectorB - The second vector.
   * @returns {number} The cosine similarity between the two vectors.
   */
  _cosineSimilarity(vectorA, vectorB) {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < this.dimension; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      magnitudeA += vectorA[i] ** 2;
      magnitudeB += vectorB[i] ** 2;
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0; // Handle edge case where one of the vectors is zero
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }
}

/**
 * Example usage:
 * const store = new VectorStoreLite(3);
 * store.addVector('vec1', [1, 0, 0]);
 * store.addVector('vec2', [0, 1, 0]);
 * const results = store.retrieve([1, 0, 0], 1);
 * console.log(results); // [{ id: 'vec1', similarity: 1 }]
 */