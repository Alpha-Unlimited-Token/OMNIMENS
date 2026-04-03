export const bayesianUncertaintyQuantification = undefined; /* SCL-export-const */
},
updateConfidence: function(chain, feedback) {
const entropy = this.calculateEntropy(chain.map(step => step.probability));
const adjustmentFactor = undefined; /* SCL-const */
chain.forEach(step => {
  step.probability = Math.min(Math.max(step.probability + adju
});
}
};