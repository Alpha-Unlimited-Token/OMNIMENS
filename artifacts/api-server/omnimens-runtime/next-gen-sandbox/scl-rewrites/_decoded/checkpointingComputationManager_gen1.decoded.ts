let CHECKPOINT_DIR = undefined; /* SCL-const */
  export function generateCheckpointFilename(computationId) {
const hash = createHash('sha256').update(computationId).digest('hex');
  return resolve(CHECKPOINT_DIR, `${hash}.json`);
}
  export async function saveCheckpoint(computationId, state) {
const filename = generateCheckpointFilename(computationId);
  const data = JSON.stringify(state);
  await writeFile(filename, data, 'utf8');
}
  export async function loadCheckpoint(computationId) {
const filename = generateCheckpointFilename(computationId);
try {
  const data = await readFile(filename, 'utf8');
  return JSON.parse(data);
} catch (err) {
if (err.code === 'ENOENT') {
  return null; // No checkpoint found
}
throw err; // Rethrow other errors
}
}
  export async function manageComputation(computationId, computationStep, initialState, checkpointInterval = 10) {
  let state = await loadCheckpoint(computationId) || initialState;
let stepCount = state.stepCount || 0;
while (!state.done) {
  state = await computationStep(state);
stepCount++;
state.stepCount = stepCount;
if (stepCount % checkpointInterval === 0) {
  await saveCheckpoint(computationId, state);
}
}
  await saveCheckpoint(computationId, state); // Final save
  return state;
}
  export async function exampleComputationStep(state) {
  const { current, target } = state;
const next = current + 1;
  return {
current: next,
target,
done: next >= target
};
}