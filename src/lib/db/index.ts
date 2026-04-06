import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzle<typeof schema>> | undefined;
  sqlite: Database.Database | undefined;
};

function createDb() {
  const dbUrl = process.env.DATABASE_URL || "file:./prisma/db/custom.db";
  // Remove "file:" prefix if present
  const dbPath = dbUrl.startsWith("file:") ? dbUrl.slice(5) : dbUrl;
  
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite, { schema });
  
  return { sqlite, db };
}

export const { sqlite, db } = globalForDb.db && globalForDb.sqlite 
  ? { sqlite: globalForDb.sqlite, db: globalForDb.db }
  : createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
  globalForDb.sqlite = sqlite;
}

export type Db = typeof db;
