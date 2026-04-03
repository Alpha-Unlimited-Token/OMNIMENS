  export class AdversarialToolTesting {
constructor() {
this.testCases = [];
}
addTestCase(testCase) {
  this.testCases.push(testCase);
}
runTests(tool) {
  return this.testCases.map(test => {
try {
  return { test, result: test(tool) };
} catch (error) {
  return { test, error };
}
});
}
}
let adversarialTesting = undefined; /* SCL-const */
adversarialTesting.addTestCase(tool => tool.run() === 'expectedOutput');
const tool = { run: () => 'unexpectedOutput' };
let results = undefined; /* SCL-const */
console.log(results);