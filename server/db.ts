import dotenv from "dotenv";
import path from "node:path";
import { existsSync } from "node:fs";

for (const p of [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), ".env.hosting"),
  path.resolve(process.cwd(), ".env.production"),
  path.resolve(process.cwd(), "..", ".env"),
]) {
  if (existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}
dotenv.config();

import { Pool, type PoolConfig, type QueryResult, type QueryResultRow } from "pg";
import { log } from "./logger.js";

// Global declaration for singleton pool in development/server environments
declare global {
  // eslint-disable-next-line no-var
  var __pgPoolInstance: Pool | undefined;
}

export class DatabaseUnavailableError extends Error {
  constructor(message = "Database unavailable") {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

function sslConfig(url = ""): PoolConfig["ssl"] {
  let mode = (process.env.DB_SSL || process.env.PGSSL || "").toLowerCase();
  if (!mode) {
    const m = /[?&]sslmode=([a-z-]+)/i.exec(url);
    if (m) mode = m[1].toLowerCase();
  }
  const isLoopback =
    url.includes("127.0.0.1") ||
    url.includes("localhost") ||
    (!url && (process.env.DB_HOST === "127.0.0.1" || process.env.DB_HOST === "localhost" || !process.env.DB_HOST));

  if (!mode) {
    mode = isLoopback ? "disable" : (process.env.NODE_ENV === "production" ? "prefer" : "disable");
  }
  if (mode === "disable" || mode === "false" || mode === "off") return false;
  if (mode === "require" || mode === "prefer" || mode === "no-verify") {
    return { rejectUnauthorized: false };
  }
  const ca = process.env.DB_SSL_CA?.replace(/\\n/g, "\n");
  return ca ? { rejectUnauthorized: true, ca } : { rejectUnauthorized: false };
}


function stripSslParams(url: string): string {
  return url
    .replace(/([?&])sslmode=[^&]*&?/i, "$1")
    .replace(/([?&])ssl=[^&]*&?/i, "$1")
    .replace(/[?&]$/, "");
}

function createPool(): Pool | null {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRESQL_URL;

  let poolConfig: PoolConfig;

  if (connectionString) {
    let finalUrl = connectionString;
    // When on the production host or if DB_HOST is set to localhost/127.0.0.1,
    // automatically swap any remote IP with 127.0.0.1 or localhost
    const hostOverride = process.env.DB_HOST_OVERRIDE || process.env.DB_HOST;
    if (hostOverride === "localhost" || hostOverride === "127.0.0.1") {
      finalUrl = finalUrl.replace(/@([^:/]+)(:\d+)?\//, `@${hostOverride}$2/`);
    }

    poolConfig = {
      connectionString: stripSslParams(finalUrl),
      ssl: sslConfig(finalUrl),
      max: parseInt(process.env.DB_POOL_MAX || "20", 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
  } else {
    // Discrete parameters fallback with 127.0.0.1 as default host
    const host = process.env.DB_HOST || process.env.PGHOST || "127.0.0.1";
    const database = process.env.DB_NAME || process.env.PGDATABASE || "yanat710";
    const user = process.env.DB_USER || process.env.PGUSER || "yanat710";
    const password =
      process.env.DB_PASSWORD ||
      process.env.PGPASSWORD ||
      "5UwsNVK0RI0DGVsC4BOmR9cLP";
    const port = parseInt(process.env.DB_PORT || process.env.PGPORT || "5432", 10);

    poolConfig = {
      host,
      port,
      database,
      user,
      password,
      ssl: sslConfig(),
      max: parseInt(process.env.DB_POOL_MAX || "20", 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
  }

  const p = new Pool(poolConfig);

  p.on("error", (err) => {
    log.error("db.pool_error", { category: "database", message: err.message });
  });

  return p;
}

export const pool: Pool | null = globalThis.__pgPoolInstance ?? createPool();

if (process.env.NODE_ENV !== "production" && pool) {
  globalThis.__pgPoolInstance = pool;
}

export function hasDb(): boolean {
  return Boolean(
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRESQL_URL ||
    (process.env.DB_NAME && process.env.DB_USER) ||
    pool
  );
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[] | null> {
  if (!pool) return null;
  try {
    const result = await pool.query<T>(text, params);
    return result.rows;
  } catch (err) {
    log.error("db.query_failed", { category: "database", message: (err as Error).message });
    return null;
  }
}

export async function queryStrict<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (!pool) throw new DatabaseUnavailableError("Database is not configured");
  try {
    const result = await pool.query<T>(text, params);
    return result.rows;
  } catch (err) {
    const e = err as Error & { code?: string };
    if (!e.code || /^(08|57P|53)/.test(e.code) || /ECONN|ETIMEDOUT|ENOTFOUND|timeout/i.test(e.message)) {
      throw new DatabaseUnavailableError(e.message);
    }
    throw err;
  }
}

export async function testDatabaseConnection(): Promise<{
  success: boolean;
  database?: string;
  serverTime?: string;
  version?: string;
  latencyMs?: number;
  error?: string;
}> {
  if (!pool) return { success: false, error: "not_configured" };
  const start = Date.now();
  try {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "SELECT current_database() as database, now() as server_time, version();"
      );
      const row = res.rows[0];
      return {
        success: true,
        database: row.database,
        serverTime: row.server_time,
        version: row.version,
        latencyMs: Date.now() - start,
      };
    } finally {
      client.release();
    }
  } catch (err: any) {
    log.error("db.ping_failed", { category: "database", message: err.message });
    return {
      success: false,
      error: err.message,
    };
  }
}

export async function pingDb(): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
  const test = await testDatabaseConnection();
  return { ok: test.success, latencyMs: test.latencyMs, error: test.error };
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end().catch(() => {});
    globalThis.__pgPoolInstance = undefined;
  }
}

const db = {
  pool,
  query,
  queryStrict,
  testDatabaseConnection,
  pingDb,
  hasDb,
  closeDb,
};

export default db;
