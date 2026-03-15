import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { authMiddleware } from "./middlewares/authMiddleware";
import router from "./routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

app.use("/api", router);

// In production, serve the GODFLESH frontend static build
if (process.env.NODE_ENV === "production") {
  const godfleshDist = path.resolve(__dirname, "../../godflesh/dist/public");
  app.use("/godflesh", express.static(godfleshDist));
  app.get("/godflesh/*", (_req, res) => {
    res.sendFile(path.join(godfleshDist, "index.html"));
  });
  app.get("/", (_req, res) => res.redirect("/godflesh"));
}

export default app;
