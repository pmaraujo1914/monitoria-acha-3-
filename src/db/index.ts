import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.js";

let globalPool: Pool | null = null;

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in environment variables");
  }

  if (!globalPool) {
    console.log("[DATABASE] Creating new Postgres connection pool...");

    globalPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    });
  }

  return drizzle(globalPool, { schema });
}
