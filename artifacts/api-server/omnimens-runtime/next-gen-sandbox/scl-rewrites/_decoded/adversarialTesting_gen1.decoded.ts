  export class AdversarialTesting {
constructor(memory, operations) {
this.memory = memory;
this.operations = operations;
}
generateEdgeCases() {
  return this.operations.generateComplexScenarios(this.memory);
}
testAgents(agents) {
let cases = undefined; /* SCL-const */
agents.forEach(alpha => {
cases.forEach(testCase => {
alpha.runTest(testCase);
});
});
}
}