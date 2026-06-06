// Apply a single SQL migration file against the Supabase Postgres instance.
//
// Usage (PowerShell):
//   $env:PGHOST="aws-1-ap-south-1.pooler.supabase.com"
//   $env:PGUSER="postgres.<ref>"
//   $env:PGPASSWORD="<db-password>"
//   node scripts/run-migration.mjs supabase/migrations/004_saved_ngos.sql
//
// Wrapped in a single transaction — applies fully or rolls back cleanly.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, isAbsolute } from 'node:path';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));

const relPath = process.argv[2];
if (!relPath) {
  console.error('ERROR: pass a migration file path, e.g. supabase/migrations/004_saved_ngos.sql');
  process.exit(1);
}
const sqlPath = isAbsolute(relPath) ? relPath : join(__dirname, '..', relPath);

const cfg = {
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || 'postgres',
};
if (!cfg.host || !cfg.user || !cfg.password) {
  console.error('ERROR: set PGHOST, PGUSER, PGPASSWORD first.');
  process.exit(1);
}

const sql = readFileSync(sqlPath, 'utf8');
const client = new Client({
  ...cfg,
  ssl: { rejectUnauthorized: false },
  statement_timeout: 0,
});

try {
  await client.connect();
  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');
  console.log(`Applied ${relPath} successfully.`);
} catch (err) {
  await client.query('ROLLBACK').catch(() => {});
  console.error('Migration failed, rolled back:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
