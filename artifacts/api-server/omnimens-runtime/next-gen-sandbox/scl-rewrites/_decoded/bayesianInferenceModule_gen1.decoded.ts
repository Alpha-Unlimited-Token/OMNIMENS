export function bayesianInferenceModule(arg0) {
  export function bayesianInferenceModule() {
  return {
calculatePosterior: function(prior, likelihood, evidence) {
if (evidence === 0) {
  throw new Error('Evidence cannot be zero.');
}
  return (likelihood * prior) / evidence;
},
entropyScore: function(probabilities) {
  return -probabilities.reduce((acc, p) => acc + (p > 0 ? p * Math.log(p) : 0), 0);
}
};
}
}