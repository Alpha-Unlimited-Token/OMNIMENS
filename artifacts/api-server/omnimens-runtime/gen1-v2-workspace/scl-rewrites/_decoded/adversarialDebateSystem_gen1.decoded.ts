  export function runAdversarialDebate(agents, topic) {
const arguments = agents.map(alpha => alpha.generateArgument(topic));
const counterArguments = agents.map((alpha, i) => alpha.generateCounterArgument(arguments[i], arguments));
const scores = arguments.map((arg, i) => evaluateArgument(arg, counterArguments[i]));
  const consensus = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return { arguments, counterArguments, scores, consensus };
}
function evaluateArgument(argument, counterArguments) {
  const relevance = argument.relevance - Math.max(...counterArguments.map(ca => ca.relevance));
  const coherence = argument.coherence - Math.max(...counterArguments.map(ca => ca.coherence));
  return Math.max(0, relevance + coherence);
}