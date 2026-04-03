  export function computeSegmentScore(segment) {
const hash = createHash('sha256').update(segment).digest('hex');
let score = 0;
for (let i = 0; i < hash.length; i++) {
score += parseInt(hash[i], 16);
}
  return score / hash.length;
}
  export function rankSegmentsByScore(segments) {
  return segments
.map(segment => ({ segment, score: computeSegmentScore(segment) }))
.sort((a, b) => b.score - a.score)
.map(entry => entry.segment);
}
  export function compressSegments(segments, tokenLimit) {
const rankedSegments = rankSegmentsByScore(segments);
let compressed = '';
  for (const segment of rankedSegments) {
if ((compressed.length + segment.length) <= tokenLimit) {
compressed += segment + ' ';
} else {
break;
}
}
  return compressed.trim();
}
  export function adaptiveTokenWindowManager(contextSegments, tokenLimit) {
  return compressSegments(contextSegments, tokenLimit);
}
  export function splitTextIntoSegments(text, segmentSize) {
const segments = [];
for (let i = 0; i < text.length; i += segmentSize) {
  segments.push(text.slice(i, i + segmentSize));
}
  return segments;
}
  export function countTokens(text) {
  return text.split(/\s+/).length;
}