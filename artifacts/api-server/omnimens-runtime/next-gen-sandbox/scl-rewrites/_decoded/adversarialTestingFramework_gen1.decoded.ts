  export class AdversarialTestingFramework {
constructor() {
this.testCases = [];
}
addTestCase(testCase) {
  this.testCases.push(testCase);
}
runTests() {
this.testCases.forEach(testCase => {
  console.log(`Running test case: ${testCase.name}`);
testCase.run();
});
}
}