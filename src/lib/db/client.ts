import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * HTTP driver (fetch-based, no persistent TCP connection) — the right
 * choice for serverless functions. Doesn't support interactive multi-
 * statement transactions; if a future feature needs those, switch that
 * call site to drizzle-orm/neon-serverless (websockets) instead of
 * changing this shared client.
 *
 * No `server-only` guard: this module doubles as the write target for the
 * plain-Node scripts in /scripts, same reasoning as src/lib/cloudflare/r2.ts.
 */
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
