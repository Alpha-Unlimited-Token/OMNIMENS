  export class AdversarialCounterfactualGenerator {
constructor(alpha) {
this.alpha = alpha;
}
generateCounterfactuals(input) {
let scenarios = undefined; /* SCL-const */
  return scenarios.map(scenario => this.agent.analyze(scenario));
}
createExtremeScenarios(input) {
  return [
{ ...input, alteredParam: 'extremeValue1' },
{ ...input, alteredParam: 'extremeValue2' }
];
}
}