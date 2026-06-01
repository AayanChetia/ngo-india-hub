/**
 * seed-ngos.ts
 * Reads NGO_India_Dataset_v2.xlsx and inserts all 234 NGOs into:
 *   - ngos table (all main fields)
 *   - ngo_categories table (primary + secondary category links)
 *
 * Usage: npm run db:seed-ngos
 * Safe to re-run — uses ON CONFLICT DO NOTHING / DO UPDATE for idempotency.
 * Requires DATABASE_URL in .env.local.
 */

import { Client } from 'pg'
import { config } from 'dotenv'
import * as XLSX from 'xlsx'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

config({ path: join(root, '.env.local') })

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL || DATABASE_URL.includes('PASTE_DB_PASSWORD_HERE')) {
  console.error(
    '\n❌  DATABASE_URL is not set.\n' +
    '    Fill in the password in .env.local first (Settings → Database → URI).\n'
  )
  process.exit(1)
}

const db = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })

// ── value parsers ─────────────────────────────────────────────

const yesNo = (v: unknown): boolean =>
  String(v ?? '').trim().toLowerCase() === 'yes'

/** DONATION AVAILABLE holds descriptive text, not Yes/No.
 *  Any non-empty, non-"no" value means donations are accepted. */
const donationBool = (v: unknown): boolean => {
  const s = String(v ?? '').trim()
  return s !== '' && s.toLowerCase() !== 'no'
}

const parseIntLoose = (v: unknown): number | null => {
  if (v === null || v === undefined) return null
  const n = parseInt(String(v).replace(/,/g, '').trim(), 10)
  return isNaN(n) ? null : n
}

const parseJsonObj = (v: unknown): Record<string, string> => {
  try { return JSON.parse(String(v ?? '{}')) } catch { return {} }
}

const nullIfEmpty = (v: unknown): string | null => {
  const s = String(v ?? '').trim()
  return s === '' || s === 'null' ? null : s
}

// ── main ──────────────────────────────────────────────────────

async function main() {
  await db.connect()
  console.log('\n── seed-ngos ────────────────────────────────────────────')

  // Verify prerequisite tables have data
  const { rows: [{ count: stateCount }] } = await db.query('SELECT COUNT(*) FROM states')
  const { rows: [{ count: catCount }] }   = await db.query('SELECT COUNT(*) FROM categories')
  if (Number(stateCount) === 0 || Number(catCount) === 0) {
    console.error(
      '❌  States or categories table is empty.\n' +
      '   Run `npm run db:setup` first to apply migrations and seed reference data.'
    )
    process.exit(1)
  }

  // Load reference lookups
  const stateRows = (await db.query<{ id: string; name: string }>('SELECT id, name FROM states')).rows
  const stateMap  = new Map(stateRows.map(r => [r.name, r.id]))

  const catRows   = (await db.query<{ id: string; name: string }>('SELECT id, name FROM categories')).rows
  const catMap    = new Map(catRows.map(r => [r.name, r.id]))

  console.log(`  Loaded ${stateMap.size} states, ${catMap.size} categories from DB`)

  // Load Excel
  const wb   = XLSX.read(readFileSync(join(root, 'docs', 'NGO_India_Dataset_v2.xlsx')))
  const ws   = wb.Sheets['NGO_Master']
  const raw  = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null })

  // Row 0 is the column header row — build key→label map
  const excelKeys = Object.keys(raw[0])
  const labelOf   = (i: number) => String((raw[0] as Record<string, unknown>)[excelKeys[i]] ?? '')

  // Verify expected column order matches what we inspected
  const expectedLabels: Record<number, string> = {
    0: 'NGO ID', 1: 'SLUG', 2: 'NGO NAME', 3: 'PRIMARY CATEGORY',
    4: 'SECONDARY CATEGORIES', 5: 'STATE', 8: 'YEAR ESTABLISHED',
    19: 'VERIFIED', 20: 'LISTING STATUS', 21: 'VOLUNTEER AVAILABLE',
    22: 'INTERNSHIP AVAILABLE', 23: 'DONATION AVAILABLE', 24: 'ACCEPTS CSR',
    28: 'BENEFICIARIES', 32: 'IMPACT SCORE', 33: 'LOGO URL',
    34: 'SOCIAL LINKS', 35: 'LAST VERIFIED',
  }
  for (const [idx, label] of Object.entries(expectedLabels)) {
    if (labelOf(Number(idx)) !== label) {
      console.error(`❌  Column ${idx} expected "${label}" but got "${labelOf(Number(idx))}"`)
      process.exit(1)
    }
  }

  const dataRows = raw.slice(1)  // 234 NGO rows
  console.log(`  ${dataRows.length} NGO rows found in NGO_Master sheet`)

  // Count rows before insert to detect what changed
  const before = Number(
    (await db.query('SELECT COUNT(*) FROM ngos')).rows[0].count
  )

  await db.query('BEGIN')

  let catLinksInserted = 0
  const warnings: string[] = []

  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i]
    const get = (col: number) => r[excelKeys[col]]

    const ngoId            = nullIfEmpty(get(0)) ?? `UNKNOWN_${i}`
    const slug             = nullIfEmpty(get(1)) ?? ngoId
    const name             = nullIfEmpty(get(2)) ?? 'Unknown'
    const primaryCatName   = String(get(3) ?? '')
    const secondaryCatRaw  = nullIfEmpty(get(4))
    const stateName        = String(get(5) ?? '')
    const city             = nullIfEmpty(get(6))
    const address          = nullIfEmpty(get(7))
    const pincode          = nullIfEmpty(get(8))
    const foundedYear      = parseIntLoose(get(9))
    const description      = nullIfEmpty(get(10))
    const longDescription  = nullIfEmpty(get(11))
    const website          = nullIfEmpty(get(12))
    const email            = nullIfEmpty(get(13))
    const phone            = nullIfEmpty(get(14))
    const regNumber        = nullIfEmpty(get(15))
    const is80g            = nullIfEmpty(get(16)) ?? 'Verify'
    const is12a            = nullIfEmpty(get(17)) ?? 'Verify'
    const isFcra           = nullIfEmpty(get(18)) ?? 'Verify'
    const isVerified       = yesNo(get(19))
    const listingStatus    = nullIfEmpty(get(20)) ?? 'Active'
    const volunteerAvail   = yesNo(get(21))
    const internshipAvail  = yesNo(get(22))
    const donationAvail    = donationBool(get(23))
    const acceptsCsr       = yesNo(get(24))
    // cols 25-27: ACTIVITIES, OPPORTUNITIES, SKILLS — seeded separately later
    const beneficiaries    = parseIntLoose(get(28))
    // col 29: ACTIVE PROJECTS — contains website URL, not used
    const teamSize         = nullIfEmpty(get(30))
    const fundingType      = nullIfEmpty(get(31))
    const impactScore      = parseIntLoose(get(32))
    const logoUrl          = nullIfEmpty(get(33))
    const socialLinks      = parseJsonObj(get(34))
    const lastVerifiedAt   = nullIfEmpty(get(35))
    const sourceUrl        = nullIfEmpty(get(36))

    const stateId = stateMap.get(stateName) ?? null
    if (!stateId && stateName) {
      warnings.push(`Row ${i + 2}: unknown state "${stateName}" for ${ngoId}`)
    }

    // Upsert NGO — DO UPDATE on conflict so RETURNING always fires
    const { rows: [ngoRow] } = await db.query<{ id: string }>(
      `INSERT INTO ngos (
        ngo_id, slug, name, description, long_description,
        website, email, phone, logo_url, social_links,
        founded_year, state_id, city, address, pincode,
        registration_number, is_80g, is_12a, is_fcra,
        is_verified, listing_status,
        volunteer_available, internship_available,
        donation_available, accepts_csr,
        team_size, funding_type, beneficiaries_count,
        impact_score, last_verified_at, source_url
      ) VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,$9,$10::jsonb,
        $11,$12,$13,$14,$15,
        $16,$17,$18,$19,
        $20,$21,
        $22,$23,
        $24,$25,
        $26,$27,$28,
        $29,$30,$31
      )
      ON CONFLICT (ngo_id) DO UPDATE SET updated_at = now()
      RETURNING id`,
      [
        ngoId, slug, name, description, longDescription,
        website, email, phone, logoUrl, JSON.stringify(socialLinks),
        foundedYear, stateId, city, address, pincode,
        regNumber, is80g, is12a, isFcra,
        isVerified, listingStatus,
        volunteerAvail, internshipAvail,
        donationAvail, acceptsCsr,
        teamSize, fundingType, beneficiaries,
        impactScore, lastVerifiedAt, sourceUrl,
      ]
    )

    const dbId = ngoRow.id

    // Primary category link
    const primCatId = catMap.get(primaryCatName)
    if (primCatId) {
      const res = await db.query(
        `INSERT INTO ngo_categories (ngo_id, category_id, is_primary)
         VALUES ($1, $2, true)
         ON CONFLICT (ngo_id, category_id) DO NOTHING`,
        [dbId, primCatId]
      )
      catLinksInserted += res.rowCount ?? 0
    } else if (primaryCatName) {
      warnings.push(`Row ${i + 2}: unknown primary category "${primaryCatName}" for ${ngoId}`)
    }

    // Secondary category links (comma-separated)
    if (secondaryCatRaw) {
      for (const catName of secondaryCatRaw.split(',').map(s => s.trim()).filter(Boolean)) {
        const secCatId = catMap.get(catName)
        if (secCatId) {
          const res = await db.query(
            `INSERT INTO ngo_categories (ngo_id, category_id, is_primary)
             VALUES ($1, $2, false)
             ON CONFLICT (ngo_id, category_id) DO NOTHING`,
            [dbId, secCatId]
          )
          catLinksInserted += res.rowCount ?? 0
        } else {
          warnings.push(`Row ${i + 2}: unknown secondary category "${catName}" for ${ngoId}`)
        }
      }
    }
  }

  await db.query('COMMIT')

  // Verify
  const after    = Number((await db.query('SELECT COUNT(*) FROM ngos')).rows[0].count)
  const catLinks = Number((await db.query('SELECT COUNT(*) FROM ngo_categories')).rows[0].count)

  console.log(`\n── Results ──────────────────────────────────────────────`)
  console.log(`  NGOs newly inserted : ${after - before}`)
  console.log(`  NGOs already existed: ${dataRows.length - (after - before)}`)
  console.log(`  Total ngos rows     : ${after}`)
  console.log(`  ngo_categories links: ${catLinks}  (+${catLinksInserted} this run)`)

  if (warnings.length) {
    console.log(`\n── Warnings (${warnings.length}) ──────────────────────────────────────`)
    warnings.forEach(w => console.log(`  ⚠  ${w}`))
  }

  console.log('\n── Verification ─────────────────────────────────────────')
  if (after === 234) {
    console.log('  ✅  234 / 234 NGOs confirmed in database.\n')
  } else {
    console.warn(`  ⚠  Expected 234, got ${after}.  Check warnings above.\n`)
    process.exitCode = 1
  }
}

main()
  .catch(err => {
    db.query('ROLLBACK').catch(() => {})
    console.error('\n❌  Fatal error:', err.message)
    process.exit(1)
  })
  .finally(() => db.end())
