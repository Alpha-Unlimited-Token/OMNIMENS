import path from "path";
import { fileURLToPath } from "url";
import { build as esbuild } from "esbuild";
import { rm, readFile } from "fs/promises";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..", "..");

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times without risking some
// packages that are not bundle compatible
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nodemailer",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

function runFrontendBuild(filter: string, basePath: string) {
  console.log(`building frontend: ${filter} (BASE_PATH=${basePath})...`);
  execSync(`pnpm --filter ${filter} run build`, {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, BASE_PATH: basePath, NODE_ENV: "production" },
  });
}

async function buildAll() {
  // ── 1. Build the two frontend apps that the server will statically serve ──
  runFrontendBuild("@workspace/godflesh", "/godflesh/");
  runFrontendBuild("@workspace/super-ai-lab", "/dLdFrQJk4IwoKwlPi8O_JPls/");

  // ── 2. Build the API server itself ────────────────────────────────────────
  const distDir = path.resolve(__dirname, "dist");
  await rm(distDir, { recursive: true, force: true });

  console.log("building server...");
  const pkgPath = path.resolve(__dirname, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter(
    (dep) =>
      !allowlist.includes(dep) &&
      !(pkg.dependencies?.[dep]?.startsWith("workspace:")),
  );

  await esbuild({
    entryPoints: [path.resolve(__dirname, "src/index.ts")],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: path.resolve(distDir, "index.cjs"),
    // Polyfill import.meta.url for CJS bundles — fileURLToPath(import.meta.url)
    // needs a valid URL string, not undefined, when running in CommonJS context.
    banner: {
      js: `const _importMetaUrlCompat = (typeof __filename !== "undefined") ? require("url").pathToFileURL(__filename).href : "file:///bundle.cjs";`,
    },
    define: {
      "import.meta.url": "_importMetaUrlCompat",
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
