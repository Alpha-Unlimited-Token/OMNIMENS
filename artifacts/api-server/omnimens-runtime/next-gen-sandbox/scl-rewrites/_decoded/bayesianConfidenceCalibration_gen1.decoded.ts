export function bayesianConfidenceCalibration(arg0) {
  export function bayesianConfidenceCalibration(decisionScores) {
  const entropy = decisionScores.reduce((acc, score) => acc - score * Math.log2(score), 0);
const confidence = 1 - entropy / Math.log2(decisionScores.length);
  return { confidence, entropy };
}
}