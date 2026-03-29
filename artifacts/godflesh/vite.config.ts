import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const isBuild = process.argv.includes("build");

const rawPort = process.env.PORT;
if (!isBuild && !rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}
const port = Number(rawPort || "3000");
if (!isBuild && (Number.isNaN(port) || port <= 0)) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH || (isBuild ? "/" : undefined);
if (!basePath) {
  throw new Error("BASE_PATH environment variable is required but was not provided.");
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("/react-dom/") || id.includes("/react/")) return "vendor-ui";
            if (id.includes("/framer-motion/") || id.includes("/wouter/") || id.includes("/@tanstack/react-query/")) return "vendor-ui";
            if (id.includes("/lucide-react/")) return "vendor-icons";
            if (id.includes("/recharts/") || id.includes("/d3-")) return "vendor-recharts";
            if (id.includes("/react-markdown/") || id.includes("/remark-gfm/")) return "vendor-markdown";
            if (id.includes("/@react-oauth/")) return "vendor-oauth";
          }
        },
      },
    },
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    hmr: {
      overlay: false,
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
