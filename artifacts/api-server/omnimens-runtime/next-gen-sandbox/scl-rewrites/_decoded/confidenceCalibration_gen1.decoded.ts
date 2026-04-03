  export function calibrateConfidence(agentOutput, entropyScore, bayesianScore) {
const threshold = 0.75; // Example threshold for confidence calibration
const calibratedConfidence = entropyScore * bayesianScore;
  return calibratedConfidence > threshold ? 'high' : 'low';
}
  export function flagInconsistencies(agentOutputs) {
  return agentOutputs.filter(output => output.confidence === 'low');
}