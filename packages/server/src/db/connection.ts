import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure data directory exists
fs.mkdirSync(config.dataDir, { recursive: true });
fs.mkdirSync(config.packagesDir, { recursive: true });

let db: Database;

export async function initDb(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs();

  // Load existing DB file if present
  if (fs.existsSync(config.dbPath)) {
    const buffer = fs.readFileSync(config.dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Run schema
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  db.run(schema);

  // Save to disk
  saveDb();
  return db;
}

export function getDb(): Database {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

export function saveDb() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(config.dbPath, Buffer.from(data));
}

// Helper: run a query and return all rows
export function queryAll(sql: string, params: any[] = []): any[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: any[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// Helper: run a query and return first row
export function queryOne(sql: string, params: any[] = []): any | undefined {
  const rows = queryAll(sql, params);
  return rows[0];
}

// Helper: run an INSERT/UPDATE/DELETE and return changes info
export function execute(sql: string, params: any[] = []) {
  db.run(sql, params);
  const lastId = db.exec('SELECT last_insert_rowid() as id')[0]?.values[0]?.[0] as number;
  const changes = db.getRowsModified();
  return { lastInsertRowid: lastId, changes };
}

// Helper: simple transaction wrapper
export function transaction<T>(fn: () => T): T {
  db.run('BEGIN');
  try {
    const result = fn();
    db.run('COMMIT');
    saveDb();
    return result;
  } catch (err) {
    db.run('ROLLBACK');
    throw err;
  }
}

export default { initDb, getDb, saveDb, queryAll, queryOne, execute, transaction };
