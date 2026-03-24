/**
 * @module embeddingSearchCache
 * @description Efficient similarity search on in-memory embeddings using Locality-Sensitive Hashing (LSH).
 */

/**
 * Represents an LSH-based embedding search cache.
 */
export class EmbeddingSearchCache {
  /**
   * @constructor
   * @param {number} numHashes - Number of hash functions to use for LSH.
   * @param {number} numBands - Number of bands to divide the hash signatures into.
   */
  constructor(numHashes = 10, numBands = 5) {
    if (numHashes % numBands !== 0) {
      throw new Error("numHashes must be divisible by numBands.");
    }

    this.numHashes = numHashes;
    this.numBands = numBands;
    this.hashTables = Array.from({ length: numBands }, () => new Map());
    this.embeddings = new Map();
  }

  /**
   * Hashes a vector using a simple random projection method.
   * @* @param {number[]} vector - The input vector.
   * @returns {number[]} - Array of hash values.
   */
  _hashVector(vector) {
    const hashes = [];
    for (let i = 0; i < this.numHashes; i++) {
      const randomProjection = vector.map((val, idx) => val * Math.sin((i + 1) * idx));
      const sum = randomProjection.reduce((acc, val) => acc + val, 0);
      hashes.push(sum >= 0 ? 1 : 0);
    }
    return hashes;
  }

  /**
   * Adds an embedding to the cache.
   * @param {string} id - Unique identifier for the embedding.
   * @param {number[]} vector - The embedding vector.
   */
  addEmbedding(id, vector) {
    if (this.embeddings.has(id)) {
      throw new Error(`Embedding with id '${id}' already exists.`);
    }

    const hashValues = this._hashVector(vector);
    const bandSize = this.numHashes / this.numBands;

    for (let band = 0; band < this.numBands; band++) {
      const start = band * bandSize;
      const end = start + bandSize;
      const bandHash = hashValues.slice(start, end).join("");

      if (!this.hashTables[band].has(bandHash)) {
        this.hashTables[band].set(bandHash, new Set());
      }

      this.hashTables[band].get(bandHash).add(id);
    }

    this.embeddings.set(id, vector);
  }

  /**
   * Searches for similar embeddings in the cache.
   * @param {number[]} queryVector - The query embedding vector.
   * @param {number} [maxResults=10] - Maximum number of results to return.
   * @returns {Array<{id, similarity}>} - Array of matching embeddings with similarity scores.
   */
  search(queryVector, maxResults = 10) {
    const hashValues = this._hashVector(queryVector);
    const bandSize = this.numHashes / this.numBands;
    const candidates = new Set();

    for (let band = 0; band < this.numBands; band++) {
      const start = band * bandSize;
      const end = start + bandSize;
      const bandHash = hashValues.slice(start, end).join("");

      if (this.hashTables[band].has(bandHash)) {
        for (const id of this.hashTables[band].get(bandHash)) {
          candidates.add(id);
        }
      }
    }

    const results = [];
    for (const id of candidates) {
      const storedVector = this.embeddings.get(id);
      const similarity = this._cosineSimilarity(queryVector, storedVector);
      results.push({ id, similarity });
    }

    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, maxResults);
  }

  /**
   * Computes the cosine similarity between two vectors.
   * @* @param {number[]} vec1 - First vector.
   * @param {number[]} vec2 - Second vector.
   * @returns {number} - Cosine similarity score.
   */
  _cosineSimilarity(vec1, vec2) {
    const dotProduct = vec1.reduce((sum, val, idx) => sum + val * vec2[idx], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Clears the cache.
   */
  clear() {
    this.hashTables.forEach((table) => table.clear());
    this.embeddings.clear();
  }
}