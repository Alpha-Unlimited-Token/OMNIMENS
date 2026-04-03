function cosineSimilarity(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}
function generateEmbedding(sentence) {
const vectorSize = 128;
const vector = new Array(vectorSize).fill(0);
const words = sentence.split(/\s+/);
  const hash = (str) => {
let hashValue = 0;
for (let i = 0; i < str.length; i++) {
hashValue = (hashValue * 31 + str.charCodeAt(i)) % vectorSize;
}
  return hashValue;
};
  words.forEach((word) => {
const index = hash(word);
vector[index] += 1;
});
  return vector;
}
function clusterSentences(sentences, similarityThreshold = 0.8) {
const embeddings = sentences.map(generateEmbedding);
const clusters = [];
  sentences.forEach((sentence, i) => {
let addedToCluster = false;
  for (const cluster of clusters) {
const clusterEmbedding = generateEmbedding(cluster[0]);
if (cosineSimilarity(embeddings[i], clusterEmbedding) >= similarityThreshold) {
  cluster.push(sentence);
addedToCluster = true;
break;
}
}
if (!addedToCluster) {
  clusters.push([sentence]);
}
});
  return clusters.map((cluster) => cluster.join(" "));
}
function compressConversation(conversation, maxLength = 10) {
const clustered = clusterSentences(conversation);
  return clustered.slice(0, maxLength);
}
export { cosineSimilarity, generateEmbedding, clusterSentences, compressConversation };