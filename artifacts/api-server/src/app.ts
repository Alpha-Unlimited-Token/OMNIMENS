import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { authMiddleware } from "./middlewares/authMiddleware";
import router from "./routes";
import { startAutonomousLearning } from "./lib/omnimens-self-upgrade.js";
import { startEvolutionEngine } from "./lib/omnimens-evolution.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

app.use("/api", router);

// Start OMNIMENS autonomous internet learning loop
startAutonomousLearning();

// Start OMNIMENS deep evolution engine — code discovery, limitation analysis, self-authored modules
startEvolutionEngine();

// In production, serve the OMNIMENS frontend static build
if (process.env.NODE_ENV === "production") {
  const omnimensDist = path.resolve(__dirname, "../../omnimens/dist/public");
  app.use("/omnimens", express.static(omnimensDist));
  app.get("/omnimens/*splat", (_req, res) => {
    res.sendFile(path.join(omnimensDist, "index.html"));
  });
  app.get("/", (_req, res) => res.redirect("/omnimens"));
}

export default app;
