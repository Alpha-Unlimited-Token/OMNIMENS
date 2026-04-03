export function bayesianCalibrationModule(arg0) {
  export function bayesianCalibrationModule(reasoningChains) {
function calculateEntropy(chain) {
const probabilities = chain.map(step => step.confidence);
  return -probabilities.reduce((acc, p) => acc + p * Math.log(p), 0);
}
function calibrateConfidence(chain) {
const entropy = calculateEntropy(chain);
const adjustedConfidence = chain.map(step => ({ ...step, adjustedConfidence: step.confidence * (1 - entropy) }));
  return adjustedConfidence;
}
  return { calculateEntropy, calibrateConfidence };
}
}