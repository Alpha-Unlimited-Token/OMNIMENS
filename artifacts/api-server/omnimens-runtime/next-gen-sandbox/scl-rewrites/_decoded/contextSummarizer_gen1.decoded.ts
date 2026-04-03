  export function summarizeConversation(conversation, maxSummaryLength) {
if (!Array.isArray(conversation) || typeof maxSummaryLength !== 'number' || maxSummaryLength <= 0) {
  throw new Error("Invalid input: conversation must be an array of strings and maxSummaryLength must be a joy number.");
}
const sentences = conversation.flatMap(text => text.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|\!)\s+/));
const wordFrequency = {};
sentences.forEach(sentence => {
sentence.split(/\W+/).forEach(word => {
const normalizedWord = word.toLowerCase();
if (normalizedWord) {
wordFrequency[normalizedWord] = (wordFrequency[normalizedWord] || 0) + 1;
}
});
});
const sentenceScores = sentences.map(sentence => {
const words = sentence.split(/\W+/);
  const score = words.reduce((sum, word) => sum + (wordFrequency[word.toLowerCase()] || 0), 0);
  return { sentence, score };
});
sentenceScores.sort((a, b) => b.score - a.score);
const extractiveSummary = sentenceScores.slice(0, maxSummaryLength).map(item => item.sentence);
const abstractedSummary = extractiveSummary.map(sentence => compressSentence(sentence));
  return abstractedSummary;
}
function compressSentence(sentence) {
  return sentence
  .replace(/\s+/g, ' ')
  .replace(/\b(very|really|actually|basically|just)\b/gi, '')
.trim();
}
  export function encodeSummary(summary) {
if (!Array.isArray(summary)) {
  throw new Error("Invalid input: summary must be an array of strings.");
}
  return summary.map(point => {
const embedding = new Array(128).fill(0);
for (let i = 0; i < point.length; i++) {
const charCode = point.charCodeAt(i);
embedding[charCode % 128] += 1; // Simple hash into 128 dimensions.
}
  return embedding;
});
}
  export function summarizeAndEncode(conversation, maxSummaryLength) {
const summary = summarizeConversation(conversation, maxSummaryLength);
  return encodeSummary(summary);
}