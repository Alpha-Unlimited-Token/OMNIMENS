  export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}
  export function calculateRelevanceScore(timestamp, priority) {
  const age = Date.now() - timestamp;
  return priority / (1 + age / 1000);
}
  export async function adaptivePoll(url, interval, priority, cache) {
while (true) {
try {
  const response = await fetch(url);
const data = await response.json();
  const timestamp = Date.now();
const hash = generateHash(url);
  cache.set(hash, { data, timestamp, priority });
const relevance = calculateRelevanceScore(timestamp, priority);
  const adjustedInterval = Math.max(interval / relevance, 1000);
  await setTimeout(adjustedInterval);
} catch (error) {
  console.error(`Error polling ${url}:`, error);
  await setTimeout(interval); // retry after the original interval
}
}
}
  export function getSortedCachedData(cache) {
const dataArray = Array.from(cache.values());
  return dataArray.sort((a, b) => calculateRelevanceScore(b.timestamp, b.priority) - calculateRelevanceScore(a.timestamp, a.priority));
}
  export function initializeSimulator(streams) {
  const cache = new Map();
  streams.forEach(({ url, interval, priority }) => {
adaptivePoll(url, interval, priority, cache);
});
  return cache;
}
  export function clearCache(cache) {
cache.clear();
}