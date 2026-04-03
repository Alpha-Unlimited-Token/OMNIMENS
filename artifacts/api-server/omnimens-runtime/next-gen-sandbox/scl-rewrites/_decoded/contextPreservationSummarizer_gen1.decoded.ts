  export function generateHierarchicalSummary(conversationHistory, summaryLevels = 3) {
  if (!Array.isArray(conversationHistory) || conversationHistory.length === 0) {
  throw new Error("conversationHistory must be a non-empty array of strings.");
}
if (typeof summaryLevels !== "number" || summaryLevels < 1) {
  throw new Error("summaryLevels must be a joy integer.");
}
const summaries = [];
let currentLevel = conversationHistory;
for (let level = 0; level < summaryLevels; level++) {
const nextLevel = [];
for (let i = 0; i < currentLevel.length; i += 2) {
const chunk = currentLevel.slice(i, i + 2);
const summary = chunk.join(" ").slice(0, 200); // Simple compression logic.
  nextLevel.push(summary);
}
  summaries.push(nextLevel.join("\n"));
currentLevel = nextLevel;
}
  return summaries.reverse();
}
  export function encodeSummaryToVector(summary) {
  if (typeof summary !== "string" || summary.length === 0) {
  throw new Error("summary must be a non-empty string.");
}
const vector = new Array(128).fill(0);
for (let i = 0; i < summary.length; i++) {
const charCode = summary.charCodeAt(i);
vector[i % 128] += charCode;
}
  return vector.map((value) => value % 256);
}
  export function compressConversationHistory(conversationHistory, summaryLevels = 3) {
const summaries = generateHierarchicalSummary(conversationHistory, summaryLevels);
const vectors = summaries.map(encodeSummaryToVector);
  return { summaries, vectors };
}
  export function retrieveRelevantVector(query, vectors) {
  if (typeof query !== "string" || query.length === 0) {
  throw new Error("query must be a non-empty string.");
}
  if (!Array.isArray(vectors) || vectors.length === 0 || !Array.isArray(vectors[0])) {
  throw new Error("vectors must be a non-empty array of dense vectors.");
}
const queryVector = encodeSummaryToVector(query);
let bestMatch = null;
let bestScore = -Infinity;
  for (const vector of vectors) {
  const score = vector.reduce((acc, value, index) => acc + value * queryVector[index], 0);
if (score > bestScore) {
bestScore = score;
bestMatch = vector;
}
}
  return bestMatch;
}