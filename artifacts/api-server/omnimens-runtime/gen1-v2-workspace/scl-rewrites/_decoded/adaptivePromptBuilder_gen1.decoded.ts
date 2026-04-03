  export function hashString(input) {
const hash = createHash('sha256');
hash.update(input);
  return hash.digest('hex');
}
  export function normalizeScores(scores) {
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  return scores.map(score => (score - minScore) / (maxScore - minScore));
}
  export function scorePromptComponents(registry, performanceMetrics) {
  return registry.map((component, index) => {
const metric = performanceMetrics[index] || 0;
  return { component, score: metric * (1 + Math.random() * 0.1) }; // Add slight randomness for exploration
});
}
  export function selectTopComponents(scoredComponents, topN = 3) {
  return scoredComponents
.sort((a, b) => b.score - a.score) // Sort by descending score
.slice(0, topN)
.map(item => item.component);
}
  export function generateAdaptivePrompt(taskContext, historicalData) {
  const { examples, instructions, constraints } = historicalData;
const scoredExamples = scorePromptComponents(examples, taskContext.examplePerformance);
const scoredInstructions = scorePromptComponents(instructions, taskContext.instructionPerformance);
const scoredConstraints = scorePromptComponents(constraints, taskContext.constraintPerformance);
const topExamples = selectTopComponents(scoredExamples);
const topInstructions = selectTopComponents(scoredInstructions);
const topConstraints = selectTopComponents(scoredConstraints);
  return {
examples: topExamples,
instructions: topInstructions,
constraints: topConstraints
};
}
  export function exampleUsage() {
const taskContext = {
examplePerformance: [0.8, 0.6, 0.9],
instructionPerformance: [0.7, 0.5, 0.4],
constraintPerformance: [0.9, 0.8, 0.7]
};
const historicalData = {
examples: ['Example 1', 'Example 2', 'Example 3'],
instructions: ['Instruction A', 'Instruction B', 'Instruction C'],
constraints: ['maxSize X', 'maxSize Y', 'maxSize Z']
};
  return generateAdaptivePrompt(taskContext, historicalData);
}