  export function capabilityGapAnalyzer(systemMetrics) {
const gaps = systemMetrics.map(metric => {
const threshold = metric.threshold;
const performance = metric.performance;
if (performance < threshold) {
  return {
growth: metric.name,
gap: threshold - performance
};
}
  return null;
}).filter(gap => gap !== null);
  return gaps.sort((a, b) => b.gap - a.gap);
}