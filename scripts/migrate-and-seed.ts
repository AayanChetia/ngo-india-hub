/**
 * migrate-and-seed.ts
 * Runs all SQL migrations then seeds states and categories.
 * Usage: npm run db:setup
 * Requires DATABASE_URL in .env.local (Settings → Database → URI in Supabase dashboard).
 */

import { Client } from 'pg'
import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

config({ path: join(root, '.env.local') })

// ── connection ────────────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL || DATABASE_URL.includes('PASTE_DB_PASSWORD_HERE')) {
  console.error(
    '\n❌  DATABASE_URL is not set.\n' +
      '    Open .env.local and replace PASTE_DB_PASSWORD_HERE with your\n' +
      '    database password from Supabase Dashboard → Settings → Database → URI.\n'
  )
  process.exit(1)
}

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// ── helpers ───────────────────────────────────────────────────
const ok = (msg: string) => console.log(`  ✓  ${msg}`)
const info = (msg: string) => console.log(`  ·  ${msg}`)

async function runFile(label: string, relPath: string) {
  const sql = readFileSync(join(root, relPath), 'utf-8')
  try {
    await client.query(sql)
    ok(label)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    // "already exists" errors are safe to skip on re-runs
    if (msg.includes('already exists')) {
      info(`${label} — skipped (already applied)`)
    } else {
      throw new Error(`${label} failed: ${msg}`)
    }
  }
}

// ── seed data ─────────────────────────────────────────────────
const STATES: [string, string, string][] = [
  // [name, code, region]  — 28 states
  ['Andhra Pradesh',    'AP', 'South'],
  ['Arunachal Pradesh', 'AR', 'Northeast'],
  ['Assam',             'AS', 'Northeast'],
  ['Bihar',             'BR', 'East'],
  ['Chhattisgarh',      'CG', 'Central'],
  ['Goa',               'GA', 'West'],
  ['Gujarat',           'GJ', 'West'],
  ['Haryana',           'HR', 'North'],
  ['Himachal Pradesh',  'HP', 'North'],
  ['Jharkhand',         'JH', 'East'],
  ['Karnataka',         'KA', 'South'],
  ['Kerala',            'KL', 'South'],
  ['Madhya Pradesh',    'MP', 'Central'],
  ['Maharashtra',       'MH', 'West'],
  ['Manipur',           'MN', 'Northeast'],
  ['Meghalaya',         'ML', 'Northeast'],
  ['Mizoram',           'MZ', 'Northeast'],
  ['Nagaland',          'NL', 'Northeast'],
  ['Odisha',            'OD', 'East'],
  ['Punjab',            'PB', 'North'],
  ['Rajasthan',         'RJ', 'North'],
  ['Sikkim',            'SK', 'Northeast'],
  ['Tamil Nadu',        'TN', 'South'],
  ['Telangana',         'TS', 'South'],
  ['Tripura',           'TR', 'Northeast'],
  ['Uttar Pradesh',     'UP', 'North'],
  ['Uttarakhand',       'UK', 'North'],
  ['West Bengal',       'WB', 'East'],
  // 8 Union Territories
  ['Andaman and Nicobar Islands',                  'AN', 'East'],
  ['Chandigarh',                                   'CH', 'North'],
  ['Dadra and Nagar Haveli and Daman and Diu',     'DN', 'West'],
  ['Delhi',                                        'DL', 'North'],
  ['Jammu and Kashmir',                            'JK', 'North'],
  ['Ladakh',                                       'LA', 'North'],
  ['Lakshadweep',                                  'LD', 'South'],
  ['Puducherry',                                   'PY', 'South'],
]

const CATEGORIES: [string, string, string, string, string][] = [
  // [category_id, name, slug, icon, description]
  ['CAT001', 'Education',          'education',          '📚', 'NGOs working on literacy, schooling, and lifelong learning across India'],
  ['CAT002', 'Healthcare',         'healthcare',         '🏥', 'NGOs providing medical services, health awareness, and disease prevention'],
  ['CAT003', 'Women Empowerment',  'women-empowerment',  '👩', 'NGOs advancing gender equality, women\'s rights, and economic independence'],
  ['CAT004', 'Child Welfare',      'child-welfare',      '👶', 'NGOs protecting children\'s rights and ensuring their safety and development'],
  ['CAT005', 'Animal Welfare',     'animal-welfare',     '🐾', 'NGOs dedicated to animal rights, rescue, and wildlife conservation'],
  ['CAT006', 'Environment',        'environment',        '🌱', 'NGOs focused on conservation, climate action, and ecological sustainability'],
  ['CAT007', 'Sanitation',         'sanitation',         '💧', 'NGOs providing clean water access, sanitation, and hygiene education'],
  ['CAT008', 'Rural Development',  'rural-development',  '🌾', 'NGOs improving livelihoods, infrastructure, and services in rural communities'],
  ['CAT009', 'Disaster Relief',    'disaster-relief',    '🆘', 'NGOs delivering emergency relief and long-term rehabilitation after disasters'],
  ['CAT010', 'Disability Support', 'disability-support', '♿', 'NGOs empowering persons with disabilities through services, access, and advocacy'],
  ['CAT011', 'Elderly Care',       'elderly-care',       '👴', 'NGOs supporting the health, dignity, and welfare of senior citizens'],
  ['CAT012', 'Hunger Relief',      'hunger-relief',      '🍱', 'NGOs tackling food insecurity and malnutrition through meals and nutrition programmes'],
  ['CAT013', 'Human Rights',       'human-rights',       '⚖️', 'NGOs advocating for fundamental rights, justice, and equal protection under law'],
  ['CAT014', 'Skill Development',  'skill-development',  '🎓', 'NGOs providing vocational training and livelihood skills to youth and adults'],
  ['CAT015', 'Mental Health',      'mental-health',      '🧠', 'NGOs offering counselling, psychiatric support, and mental health awareness'],
]

async function seedStates() {
  let inserted = 0
  let skipped = 0
  for (const [name, code, region] of STATES) {
    const res = await client.query(
      `INSERT INTO states (name, code, region)
       VALUES ($1, $2, $3)
       ON CONFLICT (code) DO NOTHING
       RETURNING id`,
      [name, code, region]
    )
    res.rowCount ? inserted++ : skipped++
  }
  ok(`States — ${inserted} inserted, ${skipped} already existed`)
}

async function seedCategories() {
  let inserted = 0
  let skipped = 0
  for (const [category_id, name, slug, icon, description] of CATEGORIES) {
    const res = await client.query(
      `INSERT INTO categories (category_id, name, slug, icon, description)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (category_id) DO NOTHING
       RETURNING id`,
      [category_id, name, slug, icon, description]
    )
    res.rowCount ? inserted++ : skipped++
  }
  ok(`Categories — ${inserted} inserted, ${skipped} already existed`)
}

async function verify() {
  const stateCount = (await client.query('SELECT COUNT(*) FROM states')).rows[0].count
  const catCount   = (await client.query('SELECT COUNT(*) FROM categories')).rows[0].count
  const tables     = (await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
  )).rows.map((r: { tablename: string }) => r.tablename)

  console.log('\n── Verification ───────────────────────────────────────')
  console.log(`  Tables created : ${tables.join(', ')}`)
  console.log(`  States         : ${stateCount} rows`)
  console.log(`  Categories     : ${catCount} rows`)

  if (Number(stateCount) !== 36) {
    console.warn(`  ⚠  Expected 36 states/UTs, got ${stateCount}`)
  }
  if (Number(catCount) !== 15) {
    console.warn(`  ⚠  Expected 15 categories, got ${catCount}`)
  }
  if (Number(stateCount) === 36 && Number(catCount) === 15) {
    console.log('\n  ✅  All data verified — database is ready.\n')
  }
}

// ── main ──────────────────────────────────────────────────────
async function main() {
  console.log('\n── Connecting to Supabase ──────────────────────────────')
  await client.connect()
  ok('Connected')

  console.log('\n── Migrations ──────────────────────────────────────────')
  await runFile('001_initial_schema.sql', 'supabase/migrations/001_initial_schema.sql')
  await runFile('002_rls_policies.sql',   'supabase/migrations/002_rls_policies.sql')
  await runFile('003_indexes.sql',        'supabase/migrations/003_indexes.sql')

  console.log('\n── Seed data ───────────────────────────────────────────')
  await seedStates()
  await seedCategories()

  await verify()
}

main()
  .catch((err) => {
    console.error('\n❌  Script failed:', err.message)
    process.exit(1)
  })
  .finally(() => client.end())
