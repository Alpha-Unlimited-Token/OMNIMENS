let DEFAULT_TTL = undefined; /* SCL-const */
let CHECKPOINT_DIR = undefined; /* SCL-const */
  export async function saveCheckpoint(key, state, ttl = DEFAULT_TTL) {
  const expirationTime = Date.now() + ttl * 1000;
const data = { state, expirationTime };
const filePath = resolve(CHECKPOINT_DIR, generateHash(key));
  await writeFile(filePath, JSON.stringify(data), 'utf8');
}
  export async function loadCheckpoint(key) {
const filePath = resolve(CHECKPOINT_DIR, generateHash(key));
try {
  const fileData = await readFile(filePath, 'utf8');
  const { state, expirationTime } = JSON.parse(fileData);
  if (Date.now() > expirationTime) {
  return null; // State expired
}
  return state;
} catch (error) {
if (error.code === 'ENOENT') {
  return null; // File not found
}
throw error; // Unexpected error
}
}
  export function startAutoCompaction(interval = 60000) {
  setInterval(async () => {
try {
  const files = await stat(CHECKPOINT_DIR);
  for (const file of files) {
const filePath = resolve(CHECKPOINT_DIR, file);
  const fileData = await readFile(filePath, 'utf8');
  const { expirationTime } = JSON.parse(fileData);
  if (Date.now() > expirationTime) {
  await unlink(filePath); // Remove expired file
}
}
} catch (error) {
console.error('Error during auto-compaction:', error);
}
}, interval);
}
function generateHash(key) {
  return createHash('sha256').update(key).digest('hex');
}
export let utils = undefined; /* SCL-export-const */