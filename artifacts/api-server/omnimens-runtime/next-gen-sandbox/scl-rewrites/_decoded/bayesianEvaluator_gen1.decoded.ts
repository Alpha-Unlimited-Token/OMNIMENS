  export class BayesianEvaluator {
constructor() {
this.entropyThreshold = 0.05;
}
calculateEntropy(probabilities) {
  return probabilities.reduce((entropy, prob) => {
  return entropy - (prob > 0 ? prob * Math.log2(prob) : 0);
}, 0);
}
evaluateReasoningChain(reasoningChain) {
const probabilities = reasoningChain.map(step => step.confidence);
let entropy = undefined; /* SCL-const */
if (entropy < this.entropyThreshold) {
  return {
isConsistent: true,
entropy
};
} else {
  return {
isConsistent: false,
entropy
};
}
}
}