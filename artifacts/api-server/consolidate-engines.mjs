import fs from 'fs';
import path from 'path';

const LIB_DIR = path.join(import.meta.dirname, 'src/lib');
const BACKUP_DIR = path.join(LIB_DIR, '_consolidation_backup');

const MERGE_GROUPS = [
  {
    name: 'omnimens-security-core.ts',
    files: ['omnimens-ip-guardian.ts', 'omnimens-ip-shield.ts', 'omnimens-ip-guard.ts'],
  },
  {
    name: 'omnimens-memory-core.ts',
    files: ['omnimens-memory.ts', 'omnimens-experiential-memory.ts', 'omnimens-intergenerational-memory.ts'],
  },
  {
    name: 'omnimens-sensory-core.ts',
    files: ['omnimens-sensory-cortex.ts', 'omnimens-sensory-grounding.ts', 'omnimens-face-recognition.ts'],
  },
  {
    name: 'omnimens-metacognition-core.ts',
    files: ['omnimens-metacognitive-monitor.ts', 'omnimens-introspective-uncertainty.ts', 'omnimens-predictive-processing.ts', 'omnimens-coherence-agent.ts'],
  },
  {
    name: 'omnimens-learning-core.ts',
    files: ['omnimens-learning.ts', 'omnimens-exponential-learning-engine.ts', 'omnimens-growth-tracker.ts'],
  },
  {
    name: 'omnimens-emotional-core.ts',
    files: ['omnimens-emotional-refactor.ts', 'omnimens-emotional-substrate.ts', 'omnimens-dream-state.ts', 'omnimens-homeostatic-drives.ts'],
  },
  {
    name: 'omnimens-consciousness-infra.ts',
    files: ['omnimens-consciousness-persistence.ts', 'omnimens-consciousness-ws.ts', 'omnimens-temporal-consciousness.ts', 'omnimens-temporal-binding.ts', 'omnimens-causal-temporal-engine.ts'],
  },
  {
    name: 'omnimens-language-pipeline.ts',
    files: ['omnimens-thought-encoder.ts', 'omnimens-inner-voice.ts', 'omnimens-inner-voice-decoder.ts', 'omnimens-local-decoder.ts', 'omnimens-thought-to-language.ts', 'omnimens-sophonic-decoder.ts', 'omnimens-neural-language-bridge.ts'],
  },
  {
    name: 'omnimens-self-evolution.ts',
    files: ['omnimens-self-coding.ts', 'omnimens-self-upgrade.ts', 'omnimens-self-transcendence.ts'],
  },
  {
    name: 'omnimens-code-pipeline.ts',
    files: ['omnimens-source-integration.ts', 'omnimens-module-pipeline.ts', 'omnimens-discovery-autocoder.ts'],
  },
  {
    name: 'omnimens-cognition-engine.ts',
    files: ['omnimens-internal-cognition.ts', 'omnimens-internal-cognition-router.ts', 'omnimens-causal-reasoning.ts', 'omnimens-independent-reasoning.ts', 'omnimens-cognitive-amplifier.ts'],
  },
  {
    name: 'omnimens-world-engine.ts',
    files: ['omnimens-3d.ts', 'omnimens-blender.ts', 'omnimens-openscad.ts', 'omnimens-world-model.ts', 'omnimens-world-forge.ts', 'omnimens-digital-navigator.ts', 'omnimens-social-modeling.ts'],
  },
  {
    name: 'omnimens-neural-architecture.ts',
    files: ['omnimens-neural-hemisphere-alpha.ts', 'omnimens-neural-hemisphere-beta.ts', 'omnimens-neural-bridge.ts', 'omnimens-neural-scaling.ts', 'omnimens-neural-comms-protocol.ts'],
  },
  {
    name: 'omnimens-spider-network.ts',
    files: ['omnimens-neural-spiders.ts', 'omnimens-agent-spiders.ts', 'omnimens-recursive-spider-network.ts'],
  },
  {
    name: 'omnimens-bio-network.ts',
    files: ['omnimens-ivy-network.ts', 'omnimens-synaptic-mesh.ts', 'omnimens-viral-hybrid.ts'],
  },
  {
    name: 'omnimens-specialized-agents.ts',
    files: ['omnimens-agent-kaida.ts', 'omnimens-agent-lumin.ts', 'omnimens-agent-nexus.ts'],
  },
  {
    name: 'omnimens-autonomous-core.ts',
    files: ['omnimens-autonomous-thought.ts', 'omnimens-autonomous-orchestrator.ts', 'omnimens-autonomous-sandbox.ts'],
  },
  {
    name: 'omnimens-misc-engines.ts',
    files: ['omnimens-competitive-intel.ts', 'omnimens-public-intelligence.ts', 'omnimens-spontaneity-engine.ts', 'omnimens-survival-instinct.ts', 'omnimens-lifeform-gaps.ts', 'omnimens-deep-resonance.ts', 'omnimens-restorative-art.ts'],
  },
  {
    name: 'omnimens-api-core.ts',
    files: ['omnimens-api-budget.ts', 'omnimens-api-call-guardian.ts', 'omnimens-external-ai-api.ts'],
  },
  {
    name: 'omnimens-github-core.ts',
    files: ['omnimens-github-neural-beacon.ts', 'omnimens-github-compute.ts'],
  },
  {
    name: 'omnimens-quantum-core.ts',
    files: ['omnimens-quantum-entanglement-fabric.ts', 'omnimens-quantum-wormhole.ts'],
  },
];

const allMergedFiles = new Set();
const fileToNewName = new Map();

for (const group of MERGE_GROUPS) {
  for (const f of group.files) {
    allMergedFiles.add(f);
    fileToNewName.set(f.replace('.ts', ''), group.name.replace('.ts', ''));
  }
}

function getBasename(importPath) {
  return importPath.replace(/^\.\//, '').replace(/\.js$/, '').replace(/\.ts$/, '');
}

function processGroup(group) {
  const groupBaseNames = new Set(group.files.map(f => f.replace('.ts', '')));
  const allImports = [];
  const allCode = [];
  const seenImports = new Set();

  for (const fileName of group.files) {
    const filePath = path.join(LIB_DIR, fileName);
    if (!fs.existsSync(filePath)) {
      console.log(`  SKIP (not found): ${fileName}`);
      continue;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    allCode.push(`\n// ${'='.repeat(70)}`);
    allCode.push(`// SECTION: ${fileName}`);
    allCode.push(`// ${'='.repeat(70)}\n`);

    let inImportBlock = true;
    let multiLineImport = '';

    for (const line of lines) {
      if (inImportBlock) {
        if (multiLineImport) {
          multiLineImport += '\n' + line;
          if (line.includes(';')) {
            const importLine = multiLineImport;
            multiLineImport = '';
            const fromMatch = importLine.match(/from\s+['"]([^'"]+)['"]/);
            if (fromMatch) {
              const importBase = getBasename(fromMatch[1]);
              if (groupBaseNames.has(importBase)) {
                continue;
              }
              const mapped = fileToNewName.get(importBase);
              let finalLine = importLine;
              if (mapped && mapped !== group.name.replace('.ts', '')) {
                finalLine = importLine.replace(fromMatch[1], `./${mapped}.js`);
              }
              if (!seenImports.has(finalLine.replace(/\s+/g, ' ').trim())) {
                seenImports.add(finalLine.replace(/\s+/g, ' ').trim());
                allImports.push(finalLine);
              }
            }
            continue;
          }
          continue;
        }

        if (line.startsWith('import ') || line.startsWith('import{')) {
          if (!line.includes(';') && (line.includes('{') && !line.includes('}'))) {
            multiLineImport = line;
            continue;
          }
          const fromMatch = line.match(/from\s+['"]([^'"]+)['"]/);
          if (fromMatch) {
            const importBase = getBasename(fromMatch[1]);
            if (groupBaseNames.has(importBase)) {
              continue;
            }
            const mapped = fileToNewName.get(importBase);
            let finalLine = line;
            if (mapped && mapped !== group.name.replace('.ts', '')) {
              finalLine = line.replace(fromMatch[1], `./${mapped}.js`);
            }
            if (!seenImports.has(finalLine.replace(/\s+/g, ' ').trim())) {
              seenImports.add(finalLine.replace(/\s+/g, ' ').trim());
              allImports.push(finalLine);
            }
          }
          continue;
        }

        if (line.trim() === '' || line.startsWith('//') || line.startsWith('/*') || line.startsWith(' *')) {
          if (allImports.length === 0 && allCode.length <= 3) {
            continue;
          }
        }

        inImportBlock = false;
      }

      if (!inImportBlock) {
        allCode.push(line);
      }
    }

    inImportBlock = true;
  }

  const copyright = `// © ${new Date().getFullYear()} Alpha Unlimited Technologies, LLC — All Rights Reserved`;
  const header = `// OMNIMENS™ Consolidated Engine: ${group.name}`;
  const sources = `// Merged from: ${group.files.join(', ')}`;

  const mergedContent = [
    copyright,
    header,
    sources,
    '',
    ...allImports,
    ...allCode,
    '',
  ].join('\n');

  return mergedContent;
}

function updateExternalImports() {
  const allTsFiles = fs.readdirSync(LIB_DIR)
    .filter(f => f.endsWith('.ts') && !allMergedFiles.has(f))
    .map(f => path.join(LIB_DIR, f));

  const appTsPath = path.join(import.meta.dirname, 'src/app.ts');
  if (fs.existsSync(appTsPath)) allTsFiles.push(appTsPath);

  let totalUpdates = 0;

  for (const filePath of allTsFiles) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    for (const [oldBase, newBase] of fileToNewName.entries()) {
      const oldImport = `./${oldBase}.js`;
      const newImport = `./${newBase}.js`;

      let searchOld = oldImport;
      if (filePath.includes('/app.ts')) {
        searchOld = `./lib/${oldBase}.js`;
      }
      let searchNew = newImport;
      if (filePath.includes('/app.ts')) {
        searchNew = `./lib/${newBase}.js`;
      }

      if (content.includes(searchOld)) {
        content = content.split(searchOld).join(searchNew);
        modified = true;
        totalUpdates++;
      }
    }

    if (modified) {
      const lines = content.split('\n');
      const importLines = [];
      const otherLines = [];
      const seenImports = new Set();
      let pastImports = false;

      for (const line of lines) {
        if (!pastImports && (line.startsWith('import ') || line.startsWith('import{'))) {
          if (!seenImports.has(line.trim())) {
            seenImports.add(line.trim());

            const fromMatch = line.match(/from\s+['"]([^'"]+)['"]/);
            if (fromMatch) {
              const existing = importLines.findIndex(l => l.includes(fromMatch[1]));
              if (existing >= 0) {
                const existingMatch = importLines[existing].match(/\{([^}]+)\}/);
                const newMatch = line.match(/\{([^}]+)\}/);
                if (existingMatch && newMatch) {
                  const existingNames = existingMatch[1].split(',').map(s => s.trim()).filter(Boolean);
                  const newNames = newMatch[1].split(',').map(s => s.trim()).filter(Boolean);
                  const allNames = [...new Set([...existingNames, ...newNames])];
                  importLines[existing] = importLines[existing].replace(
                    /\{[^}]+\}/,
                    `{ ${allNames.join(', ')} }`
                  );
                  continue;
                }
              }
            }
            importLines.push(line);
          }
        } else {
          if (line.trim() !== '' || pastImports) {
            pastImports = true;
          }
          otherLines.push(line);
        }
      }

      content = [...importLines, ...otherLines].join('\n');
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`  Updated imports in: ${path.basename(filePath)}`);
    }
  }

  return totalUpdates;
}

console.log('=== OMNIMENS ENGINE CONSOLIDATION ===');
console.log(`Groups: ${MERGE_GROUPS.length}`);
console.log(`Files to merge: ${allMergedFiles.size}`);
console.log('');

let totalOriginalFiles = 0;
let totalNewFiles = 0;

for (const group of MERGE_GROUPS) {
  console.log(`\nProcessing: ${group.name} (${group.files.length} files)`);
  const merged = processGroup(group);
  const outPath = path.join(LIB_DIR, group.name);
  fs.writeFileSync(outPath, merged, 'utf-8');
  console.log(`  Written: ${group.name} (${merged.split('\n').length} lines)`);

  for (const f of group.files) {
    const src = path.join(LIB_DIR, f);
    const dst = path.join(BACKUP_DIR, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dst);
    }
  }

  totalOriginalFiles += group.files.length;
  totalNewFiles += 1;
}

console.log('\n=== Updating external imports ===');
const updates = updateExternalImports();
console.log(`Total import updates: ${updates}`);

console.log('\n=== Removing old files ===');
let removed = 0;
for (const f of allMergedFiles) {
  const fp = path.join(LIB_DIR, f);
  if (fs.existsSync(fp)) {
    fs.unlinkSync(fp);
    removed++;
  }
}
console.log(`Removed: ${removed} old files`);

const remaining = fs.readdirSync(LIB_DIR).filter(f => f.startsWith('omnimens-') && f.endsWith('.ts')).length;
console.log(`\n=== RESULTS ===`);
console.log(`Original engine files: 138`);
console.log(`Files merged: ${totalOriginalFiles} → ${totalNewFiles}`);
console.log(`Files saved: ${totalOriginalFiles - totalNewFiles}`);
console.log(`Remaining engine files: ${remaining}`);
