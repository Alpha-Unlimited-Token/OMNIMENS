import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 15000,
  connectionTimeoutMillis: 3000,
  statement_timeout: 8000,
  allowExitOnIdle: true,
});

pool.on("error", (err) => {
  console.error("[DB POOL] Unexpected pool error:", err.message);
});

export const db = drizzle(pool, { schema });

export function isPoolHealthy(): boolean {
  const waiting = pool.waitingCount;
  const total = pool.totalCount;
  const idle = pool.idleCount;
  if (waiting > 5) return false;
  if (total >= 18 && idle === 0) return false;
  return true;
}

export function getPoolStats() {
  return {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
    healthy: isPoolHealthy(),
  };
}

export * from "./schema";
