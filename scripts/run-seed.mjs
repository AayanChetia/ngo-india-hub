// One-off DB bootstrap: runs supabase/seed.sql (schema + RLS + indexes + seed)
// against the Supabase Postgres instance and prints the verify-count result.
//
// Usage:
//   $env:SUPABASE_DB_URL="postgresql://postgres.<ref>:<pwd>@<host>:5432/postgres"
//   node scripts/run-seed.mjs
//
// The seed file is wrapped in a single BEGIN/COMMIT transaction, so it either
// fully applies or rolls back cleanly. Safe to re-run (uses ON CONFLICT guards).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedPath = join(__dirname, '..', 'supabase', 'seed.sql');

// Discrete params avoid URL-encoding headaches when the password has @ / : etc.
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

const sql = readFileSync(seedPath, 'utf8');

const client = new Client({
  ...cfg,
  ssl: { rejectUnauthorized: false }, // Supabase requires SSL
  statement_timeout: 0,               // no client-side statement timeout
});

try {
  console.log('Connecting…');
  await client.connect();
  console.log('Connected. Running seed.sql (this includes schema + RLS + indexes + 234 NGOs)…');

  // The final statement in seed.sql is a SELECT of the verify counts; pg returns
  // results for every statement, so grab the last result set with rows.
  const result = await client.query(sql);
  const sets = Array.isArray(result) ? result : [result];
  const verify = [...sets].reverse().find((r) => r && r.rows && r.rows.length);

  console.log('\n✅ seed.sql applied successfully.');
  if (verify) {
    console.table(verify.rows);
  }
} catch (err) {
  console.error('\n❌ Failed:', err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
