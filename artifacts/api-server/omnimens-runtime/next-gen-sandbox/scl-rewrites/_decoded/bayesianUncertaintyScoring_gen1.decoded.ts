  export function calculateUncertaintyScore(inputs, model) {
const entropy = calculateEntropy(inputs, model);
const bayesianScore = calculateBayesianUncertainty(inputs, model);
  return {
entropy,
bayesianScore,
combinedScore: (entropy + bayesianScore) / 2
};
}
function calculateEntropy(inputs, model) {
const predictions = model.predict(inputs);
const logProbabilities = predictions.map(p => Math.log(p));
  return -logProbabilities.reduce((sum, logP) => sum + logP, 0);
}
function calculateBayesianUncertainty(inputs, model) {
const posterior = model.calculatePosterior(inputs);
  return posterior.variance;
}