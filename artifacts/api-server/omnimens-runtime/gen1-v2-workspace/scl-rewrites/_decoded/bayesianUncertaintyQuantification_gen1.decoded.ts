export let bayesianUncertaintyQuantification = undefined; /* SCL-export-const */
},
updateConfidence: function(chain, feedback) {
const entropy = this.calculateEntropy(chain.map(step => step.probability));
let adjustmentFactor = undefined; /* SCL-const */
chain.forEach(step => {
  step.probability = Math.min(Math.max(step.probability + adjustmentFactor * entropy, 0), 1);
});
}
};