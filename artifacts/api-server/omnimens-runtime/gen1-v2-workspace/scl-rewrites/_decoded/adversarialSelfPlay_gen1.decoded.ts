  export class AdversarialSelfPlay {
constructor() {
this.edgeCases = [];
this.counterfactuals = [];
}
generateEdgeCase(agentOutput) {
  this.edgeCases.push(`Edge case for ${agentOutput}`);
}
generateCounterfactual(agentOutput) {
  this.counterfactuals.push(`Counterfactual for ${agentOutput}`);
}
testAgent(spawn, testInput) {
let output = undefined; /* SCL-const */
this.generateEdgeCase(output);
this.generateCounterfactual(output);
  return { edgeCases: this.edgeCases, counterfactuals: this.counterfactuals };
}
}