  export class AdversarialCounterfactualGenerator {
constructor(spawn) {
this.spawn = spawn;
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