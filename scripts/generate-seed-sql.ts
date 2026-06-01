/**
 * generate-seed-sql.ts
 * Generates supabase/seed.sql — a single file containing all migrations +
 * reference data + 234 NGOs, ready to paste into the Supabase SQL editor.
 *
 * Usage: npm run db:generate-sql
 */

import * as XLSX from 'xlsx'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root       = join(__dirname, '..')
const out        = join(root, 'supabase', 'seed.sql')

// ── SQL value helpers ─────────────────────────────────────────

const S   = (v: unknown): string =>
  (v === null || v === undefined || String(v).trim() === '')
    ? 'NULL'
    : `'${String(v).replace(/'/g, "''")}'`

const B   = (v: unknown): string =>
  String(v ?? '').trim().toLowerCase() === 'yes' ? 'TRUE' : 'FALSE'

const BTEXT = (v: unknown): string => {
  const s = String(v ?? '').trim()
  return (s !== '' && s.toLowerCase() !== 'no') ? 'TRUE' : 'FALSE'
}

const N   = (v: unknown): string => {
  if (v === null || v === undefined) return 'NULL'
  const n = parseInt(String(v).replace(/,/g, '').trim(), 10)
  return isNaN(n) ? 'NULL' : String(n)
}

const J   = (v: unknown): string => {
  try { JSON.parse(String(v)); return S(v) } catch { return S('{}') }
}

// ── Reference data ────────────────────────────────────────────

const STATES = [
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
  // Union Territories
  ['Andaman and Nicobar Islands',                 'AN', 'East'],
  ['Chandigarh',                                  'CH', 'North'],
  ['Dadra and Nagar Haveli and Daman and Diu',    'DN', 'West'],
  ['Delhi',                                       'DL', 'North'],
  ['Jammu and Kashmir',                           'JK', 'North'],
  ['Ladakh',                                      'LA', 'North'],
  ['Lakshadweep',                                 'LD', 'South'],
  ['Puducherry',                                  'PY', 'South'],
]

const CATEGORIES = [
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

// ── Load Excel data ───────────────────────────────────────────

const wb       = XLSX.read(readFileSync(join(root, 'docs', 'NGO_India_Dataset_v2.xlsx')))
const ws       = wb.Sheets['NGO_Master']
const raw      = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null })
const excelKeys = Object.keys(raw[0])
const dataRows  = raw.slice(1)   // 234 NGO rows

console.log(`Loaded ${dataRows.length} NGO rows`)

// ── Build SQL sections ────────────────────────────────────────

const lines: string[] = []

const section = (title: string) => {
  lines.push('', `-- ${'─'.repeat(60)}`)
  lines.push(`-- ${title}`)
  lines.push(`-- ${'─'.repeat(60)}`)
}

// Header
lines.push('-- ================================================================')
lines.push('-- NGO India Hub — Complete Database Setup')
lines.push('-- Generated from NGO_India_Dataset_v2.xlsx  v2.0 June 2025')
lines.push('-- Paste this file into Supabase Dashboard → SQL Editor → Run')
lines.push('-- ================================================================')
lines.push('', 'BEGIN;')

// Migrations
for (const file of ['001_initial_schema.sql', '002_rls_policies.sql', '003_indexes.sql']) {
  section(`Migration: ${file}`)
  lines.push(readFileSync(join(root, 'supabase', 'migrations', file), 'utf-8').trim())
}

// States
section('Seed: states (28 states + 8 Union Territories)')
const stateValues = STATES.map(([name, code, region]) =>
  `  (${S(name)}, ${S(code)}, ${S(region)})`
).join(',\n')
lines.push(`INSERT INTO states (name, code, region) VALUES\n${stateValues}\nON CONFLICT (code) DO NOTHING;`)

// Categories
section('Seed: categories (15)')
const catValues = CATEGORIES.map(([id, name, slug, icon, desc]) =>
  `  (${S(id)}, ${S(name)}, ${S(slug)}, ${S(icon)}, ${S(desc)})`
).join(',\n')
lines.push(`INSERT INTO categories (category_id, name, slug, icon, description) VALUES\n${catValues}\nON CONFLICT (category_id) DO NOTHING;`)

// NGOs
section('Seed: ngos (234 rows)')
lines.push('-- Each row uses a subquery to resolve state_id from the state name.')

const catLinks: string[] = []

for (let i = 0; i < dataRows.length; i++) {
  const r         = dataRows[i]
  const g         = (col: number) => r[excelKeys[col]]
  const ngoId     = g(0)
  const stateName = String(g(5) ?? '')

  // Collect category links for later
  const primaryCat   = String(g(3) ?? '').trim()
  const secondaryRaw = String(g(4) ?? '').trim()

  if (primaryCat) {
    catLinks.push(`  (${S(ngoId)}, ${S(primaryCat)}, TRUE)`)
  }
  for (const sec of secondaryRaw.split(',').map(s => s.trim()).filter(Boolean)) {
    catLinks.push(`  (${S(ngoId)}, ${S(sec)}, FALSE)`)
  }

  const stateExpr = stateName
    ? `(SELECT id FROM states WHERE name = ${S(stateName)})`
    : 'NULL'

  lines.push(
    `INSERT INTO ngos (` +
    `ngo_id, slug, name, description, long_description, ` +
    `website, email, phone, logo_url, social_links, ` +
    `founded_year, state_id, city, address, pincode, ` +
    `registration_number, is_80g, is_12a, is_fcra, ` +
    `is_verified, listing_status, ` +
    `volunteer_available, internship_available, donation_available, accepts_csr, ` +
    `team_size, funding_type, beneficiaries_count, impact_score, last_verified_at, source_url` +
    `) VALUES (` +
    `${S(g(0))}, ${S(g(1))}, ${S(g(2))}, ${S(g(10))}, ${S(g(11))}, ` +
    `${S(g(12))}, ${S(g(13))}, ${S(g(14))}, ${S(g(33))}, ${J(g(34))}::jsonb, ` +
    `${N(g(9))}, ${stateExpr}, ${S(g(6))}, ${S(g(7))}, ${S(g(8))}, ` +
    `${S(g(15))}, ${S(g(16))}, ${S(g(17))}, ${S(g(18))}, ` +
    `${B(g(19))}, ${S(g(20))}, ` +
    `${B(g(21))}, ${B(g(22))}, ${BTEXT(g(23))}, ${B(g(24))}, ` +
    `${S(g(30))}, ${S(g(31))}, ${N(g(28))}, ${N(g(32))}, ${S(g(35))}::date, ${S(g(36))}` +
    `) ON CONFLICT (ngo_id) DO NOTHING;`
  )
}

// NGO Categories
section('Seed: ngo_categories')
lines.push('-- Links each NGO to its primary and secondary categories.')
lines.push(
  `INSERT INTO ngo_categories (ngo_id, category_id, is_primary)\n` +
  `SELECT n.id, c.id, d.is_primary\n` +
  `FROM (VALUES\n` +
  catLinks.join(',\n') + '\n' +
  `) AS d(ngo_ngo_id, cat_name, is_primary)\n` +
  `JOIN ngos n ON n.ngo_id = d.ngo_ngo_id\n` +
  `JOIN categories c ON c.name = d.cat_name\n` +
  `ON CONFLICT (ngo_id, category_id) DO NOTHING;`
)

// Verify counts at end
section('Verify counts after seeding')
lines.push(
  `SELECT\n` +
  `  (SELECT COUNT(*) FROM states)           AS state_count,\n` +
  `  (SELECT COUNT(*) FROM categories)       AS category_count,\n` +
  `  (SELECT COUNT(*) FROM ngos)             AS ngo_count,\n` +
  `  (SELECT COUNT(*) FROM ngo_categories)   AS ngo_category_links;`
)

lines.push('', 'COMMIT;', '')

// ── Write output ──────────────────────────────────────────────

const sql = lines.join('\n')
writeFileSync(out, sql, 'utf-8')
console.log(`\n✅  Written to supabase/seed.sql`)
console.log(`    Lines: ${lines.length}`)
console.log(`    Size : ${(sql.length / 1024).toFixed(1)} KB`)
console.log(`\n    → Open Supabase Dashboard → SQL Editor → New Query`)
console.log(`    → Paste the contents of supabase/seed.sql → Run\n`)
