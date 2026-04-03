  export function generateSyntheticData(numSamples, featureSize) {
const data = [];
for (let i = 0; i < numSamples; i++) {
const sample = Array.from({ length: featureSize }, () => randomInt(0, 100) / 100);
  data.push(sample);
}
  return data;
}
  export function rewardFunction(sample) {
  return sample.reduce((sum, feature) => sum + feature, 0) / sample.length;
}
  export function reinforcePolicyOptimization(data, learningRate = 0.01) {
let policy = Array(data[0].length).fill(0); // Initialize policy vector.
  for (const sample of data) {
const reward = rewardFunction(sample);
const gradient = sample.map((feature) => feature * reward);
policy = policy.map((p, i) => p + learningRate * gradient[i]);
}
  return policy;
}
  export function storePolicy(policyName, policyVector, policyIndex) {
policyIndex[policyName] = policyVector;
}
  export function retrievePolicy(policyName, policyIndex) {
  return policyIndex[policyName] || null;
}