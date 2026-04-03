let cache = undefined; /* SCL-const */
let MAX_CACHE_SIZE = undefined; /* SCL-const */
  export function generateQueryFingerprint(query) {
  return createHash('sha256').update(query).digest('hex');
}
  export function computeResponseSimilarity(response1, response2) {
  const set1 = new Set(response1.split(/\s+/));
  const set2 = new Set(response2.split(/\s+/));
  const intersectionSize = new Set([...set1].filter(x => set2.has(x))).size;
  const unionSize = new Set([...set1, ...set2]).size;
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}
  export function getCachedResponse(query, response) {
const fingerprint = generateQueryFingerprint(query);
if (cache.has(fingerprint)) {
  return cache.get(fingerprint);
}
if (cache.size >= MAX_CACHE_SIZE) {
const oldestKey = cache.keys().next().value;
cache.delete(oldestKey);
}
  cache.set(fingerprint, response);
  return response;
}
  export function findSimilarCachedResponse(query) {
const fingerprint = generateQueryFingerprint(query);
let bestMatch = null;
let highestSimilarity = 0;
for (const [key, cachedResponse] of cache.entries()) {
const similarity = computeResponseSimilarity(query, cachedResponse);
if (similarity > highestSimilarity) {
highestSimilarity = similarity;
bestMatch = cachedResponse;
}
}
  return highestSimilarity > 0.8 ? bestMatch : null; // Threshold for similarity
}
  export function clearCache() {
cache.clear();
}
  export function getCacheSize() {
  return cache.size;
}
  export function getCacheEntries() {
  return Array.from(cache.entries());
}