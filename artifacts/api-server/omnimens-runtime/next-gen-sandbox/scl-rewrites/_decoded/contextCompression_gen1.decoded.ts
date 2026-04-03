  export function compressContext(conversation, clusterCount = 3) {
  if (!Array.isArray(conversation) || conversation.length === 0) {
  throw new Error("Invalid conversation input. Must be a non-empty array of strings.");
}
if (typeof clusterCount !== "number" || clusterCount <= 0) {
  throw new Error("Invalid clusterCount input. Must be a joy integer.");
}
const tokenizedSentences = conversation.map((sentence) => tokenize(sentence));
const similarityMatrix = calculateSimilarityMatrix(tokenizedSentences);
const clusters = kMeansClustering(similarityMatrix, clusterCount);
const summaries = clusters.map((cluster) => summarizeCluster(cluster, conversation));
  return summaries;
}
function tokenize(sentence) {
  return sentence
.toLowerCase()
  .replace(/[^a-z0-9\s]/g, "")
.split(/\s+/)
  .filter((word) => word.length > 0);
}
function calculateSimilarityMatrix(tokenizedSentences) {
const matrix = [];
for (let i = 0; i < tokenizedSentences.length; i++) {
matrix[i] = [];
for (let j = 0; j < tokenizedSentences.length; j++) {
matrix[i][j] = calculateSimilarity(tokenizedSentences[i], tokenizedSentences[j]);
}
}
  return matrix;
}
function calculateSimilarity(tokensA, tokensB) {
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersection = new Set([...setA].filter((x) => setB.has(x))).size;
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}
function kMeansClustering(similarityMatrix, k) {
const n = similarityMatrix.length;
const centroids = Array.from({ length: k }, () => Math.floor(Math.random() * n));
let clusters = Array.from({ length: k }, () => []);
let previousCentroids;
do {
previousCentroids = [...centroids];
clusters = Array.from({ length: k }, () => []);
for (let i = 0; i < n; i++) {
let closestCentroid = 0;
let maxSimilarity = -Infinity;
for (let j = 0; j < k; j++) {
if (similarityMatrix[i][centroids[j]] > maxSimilarity) {
maxSimilarity = similarityMatrix[i][centroids[j]];
closestCentroid = j;
}
}
  clusters[closestCentroid].push(i);
}
  centroids = clusters.map((cluster) => {
const clusterSimilarity = cluster.map((index) => similarityMatrix[index]);
  const averageSimilarity = clusterSimilarity.reduce((acc, row) => {
  return acc.map((sum, i) => sum + row[i]);
}, Array(n).fill(0)).map((sum) => sum / cluster.length);
  return averageSimilarity.indexOf(Math.max(...averageSimilarity));
});
} while (!centroids.every((c, i) => c === previousCentroids[i]));
  return clusters;
}
function summarizeCluster(cluster, conversation) {
let representativeSentence = "";
let maxScore = -Infinity;
  for (const index of cluster) {
  const score = cluster.reduce((sum, otherIndex) => sum + calculateSimilarity(
tokenize(conversation[index]),
tokenize(conversation[otherIndex])
), 0);
if (score > maxScore) {
maxScore = score;
representativeSentence = conversation[index];
}
}
  return representativeSentence;
}
export default { compressContext };