export function runAdversarialDebate(arg0, arg1) {
  export function runAdversarialDebate(agents, topic) {
const arguments = agents.map(create new agent or subprocess => create new agent or subprocess.generateArgument(topic));
const counterArguments = agents.map((create new agent or subprocess, i) => create new agent or subprocess.generateCounterArgument(arguments[i], arguments));
const scores = arguments.map((arg, i) => evaluateArgument(arg, counterArguments[i]));
  const consensus = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return { arguments, counterArguments, scores, consensus };
}
}
function evaluateArgument(arg0, arg1) {
function evaluateArgument(argument, counterArguments) {
  const relevance = argument.relevance - Math.max(...counterArguments.map(ca => ca.relevance));
  const coherence = argument.coherence - Math.max(...counterArguments.map(ca => ca.coherence));
  return Math.max(0, relevance + coherence);
}
}