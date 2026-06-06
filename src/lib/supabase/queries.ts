import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Database,
  NGO,
  NgoProfile,
  Category,
  State,
  Program,
  Review,
  NgoGallery,
} from '@/types/database'

type DbClient = SupabaseClient<Database>

// ============================================================
// Filter types
// ============================================================

export type SortOption =
  | 'impact_score'
  | 'name'
  | 'founded_year_asc'
  | 'founded_year_desc'
  | 'beneficiaries_count'

export type NgoFilters = {
  state_id?: string
  category_slugs?: string[]
  city?: string
  is_verified?: boolean
  volunteer_available?: boolean
  internship_available?: boolean
  donation_available?: boolean
  accepts_csr?: boolean
  is_80g?: boolean
  impact_score_min?: number
  impact_score_max?: number
  founded_before?: number
  sort?: SortOption
}

// ============================================================
// Internal helpers
// ============================================================

// Columns selected for every NGO list / detail query.
// Embeds states and ngo_categories so toNgo() can map the joined fields.
const NGO_SELECT = `
  id, ngo_id, slug, name, description, long_description,
  social_links, city, is_80g, is_12a, is_fcra, is_verified,
  listing_status, volunteer_available, internship_available,
  donation_available, accepts_csr, impact_score, beneficiaries_count,
  created_at, updated_at,
  states ( name ),
  ngo_categories ( is_primary, categories ( name ) )
`.trim()

type RawNgo = {
  id: string
  ngo_id: string
  slug: string
  name: string
  description: string | null
  long_description: string | null
  social_links: Record<string, string>
  city: string | null
  is_80g: string
  is_12a: string
  is_fcra: string
  is_verified: boolean
  listing_status: string
  volunteer_available: boolean
  internship_available: boolean
  donation_available: boolean
  accepts_csr: boolean
  impact_score: number | null
  beneficiaries_count: number | null
  created_at: string
  updated_at: string
  states: { name: string } | null
  ngo_categories: Array<{
    is_primary: boolean
    categories: { name: string } | null
  }>
}

function toNgo(raw: RawNgo): NGO {
  const primaryCat = raw.ngo_categories.find((nc) => nc.is_primary)
  const fallbackCat = raw.ngo_categories[0]
  return {
    id: raw.id,
    ngo_id: raw.ngo_id,
    slug: raw.slug,
    name: raw.name,
    description: raw.description,
    long_description: raw.long_description,
    primary_category:
      primaryCat?.categories?.name ?? fallbackCat?.categories?.name ?? '',
    state: raw.states?.name ?? '',
    city: raw.city ?? '',
    is_80g: raw.is_80g as NGO['is_80g'],
    is_12a: raw.is_12a as NGO['is_12a'],
    is_fcra: raw.is_fcra as NGO['is_fcra'],
    is_verified: raw.is_verified,
    listing_status: raw.listing_status as NGO['listing_status'],
    volunteer_available: raw.volunteer_available,
    internship_available: raw.internship_available,
    donation_available: raw.donation_available,
    accepts_csr: raw.accepts_csr,
    impact_score: raw.impact_score ?? 0,
    beneficiaries_count: raw.beneficiaries_count,
    social_links: raw.social_links ?? {},
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  }
}

// Applies optional filters and sort to any active-NGO query.
// Uses `any` for the query builder to avoid fighting Supabase's deep generics.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters(query: any, filters: NgoFilters): any {
  if (filters.state_id) query = query.eq('state_id', filters.state_id)
  if (filters.city) query = query.ilike('city', `%${filters.city}%`)
  if (filters.is_verified) query = query.eq('is_verified', true)
  if (filters.volunteer_available) query = query.eq('volunteer_available', true)
  if (filters.internship_available) query = query.eq('internship_available', true)
  if (filters.donation_available) query = query.eq('donation_available', true)
  if (filters.accepts_csr) query = query.eq('accepts_csr', true)
  if (filters.is_80g) query = query.eq('is_80g', 'Yes')
  if (filters.impact_score_min !== undefined)
    query = query.gte('impact_score', filters.impact_score_min)
  if (filters.impact_score_max !== undefined)
    query = query.lte('impact_score', filters.impact_score_max)
  if (filters.founded_before !== undefined)
    query = query.lt('founded_year', filters.founded_before)

  switch (filters.sort) {
    case 'name':
      query = query.order('name', { ascending: true })
      break
    case 'founded_year_asc':
      query = query.order('founded_year', { ascending: true })
      break
    case 'founded_year_desc':
      query = query.order('founded_year', { ascending: false })
      break
    case 'beneficiaries_count':
      query = query.order('beneficiaries_count', { ascending: false })
      break
    default:
      query = query.order('impact_score', { ascending: false })
  }

  return query
}

// ============================================================
// NGO queries
// ============================================================

/** Fetch a single active NGO by URL slug. Returns null if not found. */
export async function getNgoBySlug(
  client: DbClient,
  slug: string
): Promise<NGO | null> {
  const { data, error } = await client
    .from('ngos')
    .select(NGO_SELECT)
    .eq('slug', slug)
    .eq('listing_status', 'Active')
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    throw error
  }

  return toNgo(data as unknown as RawNgo)
}

// Full column set for the NGO profile page (contact + registration detail).
const NGO_PROFILE_SELECT = `
  id, ngo_id, slug, name, description, long_description,
  website, email, phone, logo_url, social_links,
  founded_year, city, address, pincode, registration_number,
  is_80g, is_12a, is_fcra, is_verified, listing_status,
  volunteer_available, internship_available, donation_available,
  accepts_csr, team_size, funding_type, beneficiaries_count,
  impact_score, created_at, updated_at,
  states ( name ),
  ngo_categories ( is_primary, categories ( name ) )
`.trim()

type RawNgoProfile = RawNgo & {
  website: string | null
  email: string | null
  phone: string | null
  logo_url: string | null
  founded_year: number | null
  address: string | null
  pincode: string | null
  registration_number: string | null
  team_size: string | null
  funding_type: string | null
}

function toNgoProfile(raw: RawNgoProfile): NgoProfile {
  const base = toNgo(raw)
  return {
    ...base,
    website: raw.website,
    email: raw.email,
    phone: raw.phone,
    logo_url: raw.logo_url,
    founded_year: raw.founded_year,
    address: raw.address,
    pincode: raw.pincode,
    registration_number: raw.registration_number,
    team_size: raw.team_size,
    funding_type: raw.funding_type,
    categories: raw.ngo_categories
      .map((nc) => nc.categories?.name)
      .filter((n): n is string => Boolean(n)),
  }
}

/** Fetch a single active NGO with full detail by slug. Returns null if absent. */
export async function getNgoProfileBySlug(
  client: DbClient,
  slug: string
): Promise<NgoProfile | null> {
  const { data, error } = await client
    .from('ngos')
    .select(NGO_PROFILE_SELECT)
    .eq('slug', slug)
    .eq('listing_status', 'Active')
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    throw error
  }

  return toNgoProfile(data as unknown as RawNgoProfile)
}

/** Fetch a category by its URL slug. Returns null if not found. */
export async function getCategoryBySlug(
  client: DbClient,
  slug: string
): Promise<Category | null> {
  const { data, error } = await client
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as Category
}

/**
 * Fetch active NGOs whose PRIMARY category matches the given slug.
 * Using is_primary avoids pulling in NGOs that merely carry the category as a
 * secondary tag (e.g. a Human Rights NGO also tagged Education).
 */
export async function getNgosByCategory(
  client: DbClient,
  categorySlug: string,
  filters: NgoFilters = {}
): Promise<NGO[]> {
  const { data: rawCategory, error: catError } = await client
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .single()
  const category = rawCategory as unknown as { id: string } | null

  if (catError || !category) return []

  const { data: rawPivot, error: pivotError } = await client
    .from('ngo_categories')
    .select('*')
    .eq('category_id', category.id)
    .eq('is_primary', true)
  const pivotRows = rawPivot as unknown as { ngo_id: string }[] | null

  if (pivotError || !pivotRows || pivotRows.length === 0) return []

  const ngoIds = pivotRows.map((r) => r.ngo_id)

  let query = client
    .from('ngos')
    .select(NGO_SELECT)
    .eq('listing_status', 'Active')
    .in('id', ngoIds)

  query = applyFilters(query, filters)

  const { data, error } = await query
  if (error) throw error

  return ((data ?? []) as unknown as RawNgo[]).map(toNgo)
}

/**
 * URL slug for a state, derived from its name.
 * "West Bengal" -> "west-bengal", "Delhi" -> "delhi".
 */
export function stateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Resolve a state by its URL slug (derived from name). Returns null if absent. */
export async function getStateBySlug(
  client: DbClient,
  slug: string
): Promise<State | null> {
  const { data, error } = await client.from('states').select('*')
  if (error) throw error
  const target = slug.toLowerCase()
  return (
    ((data ?? []) as State[]).find((s) => stateSlug(s.name) === target) ?? null
  )
}

/** Fetch all active NGOs in a given state by its UUID. */
export async function getNgosByStateId(
  client: DbClient,
  stateId: string,
  filters: NgoFilters = {}
): Promise<NGO[]> {
  let query = client
    .from('ngos')
    .select(NGO_SELECT)
    .eq('listing_status', 'Active')
    .eq('state_id', stateId)

  query = applyFilters(query, filters)

  const { data, error } = await query
  if (error) throw error

  return ((data ?? []) as unknown as RawNgo[]).map(toNgo)
}

export type StateCategoryCount = {
  name: string
  slug: string
  count: number
}

/**
 * Count of active NGOs per PRIMARY category within a state.
 * Used for the clickable category-breakdown chips on a state page.
 */
export async function getStateCategoryBreakdown(
  client: DbClient,
  stateId: string
): Promise<StateCategoryCount[]> {
  const { data, error } = await client
    .from('ngo_categories')
    .select('categories ( name, slug ), ngos!inner ( state_id, listing_status )')
    .eq('is_primary', true)
    .eq('ngos.state_id', stateId)
    .eq('ngos.listing_status', 'Active')

  if (error) throw error

  type Row = { categories: { name: string; slug: string } | null }
  const counts = new Map<string, StateCategoryCount>()
  for (const row of (data ?? []) as unknown as Row[]) {
    const cat = row.categories
    if (!cat) continue
    const existing = counts.get(cat.slug)
    if (existing) existing.count += 1
    else counts.set(cat.slug, { name: cat.name, slug: cat.slug, count: 1 })
  }

  return Array.from(counts.values()).sort((a, b) => b.count - a.count)
}

/** All states that have at least one active NGO, with counts. For /state grid. */
export async function getStatesWithCounts(
  client: DbClient
): Promise<StateWithCount[]> {
  const [statesRes, ngoRes] = await Promise.all([
    client.from('states').select('*'),
    client
      .from('ngos')
      .select('state_id')
      .eq('listing_status', 'Active')
      .not('state_id', 'is', null),
  ])

  if (statesRes.error) throw statesRes.error
  if (ngoRes.error) throw ngoRes.error

  const counts: Record<string, number> = {}
  for (const row of (ngoRes.data ?? []) as { state_id: string }[]) {
    counts[row.state_id] = (counts[row.state_id] ?? 0) + 1
  }

  return ((statesRes.data ?? []) as State[])
    .map((s) => ({ ...s, count: counts[s.id] ?? 0 }))
    .filter((s) => s.count > 0)
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** Fetch all active NGOs in a given state (identified by two-letter code e.g. "MH"). */
export async function getNgosByState(
  client: DbClient,
  stateCode: string,
  filters: NgoFilters = {}
): Promise<NGO[]> {
  const { data: rawState, error: stateError } = await client
    .from('states')
    .select('*')
    .eq('code', stateCode.toUpperCase())
    .single()
  const state = rawState as unknown as { id: string } | null

  if (stateError || !state) return []

  let query = client
    .from('ngos')
    .select(NGO_SELECT)
    .eq('listing_status', 'Active')
    .eq('state_id', state.id)

  query = applyFilters(query, filters)

  const { data, error } = await query
  if (error) throw error

  return ((data ?? []) as unknown as RawNgo[]).map(toNgo)
}

/** Fetch top N active NGOs ordered by impact score — used on the homepage. */
export async function getFeaturedNgos(
  client: DbClient,
  limit = 6
): Promise<NGO[]> {
  const { data, error } = await client
    .from('ngos')
    .select(NGO_SELECT)
    .eq('listing_status', 'Active')
    .eq('is_verified', true)
    .order('impact_score', { ascending: false })
    .limit(limit)

  if (error) throw error

  return ((data ?? []) as unknown as RawNgo[]).map(toNgo)
}

/** Fetch active NGOs with full filter support — used by the /search page. */
export async function searchNgos(
  client: DbClient,
  filters: NgoFilters = {}
): Promise<NGO[]> {
  let query = client
    .from('ngos')
    .select(NGO_SELECT)
    .eq('listing_status', 'Active')

  query = applyFilters(query, filters)

  const { data, error } = await query
  if (error) throw error

  return ((data ?? []) as unknown as RawNgo[]).map(toNgo)
}

/**
 * Resolve a list of category slugs to the set of active-NGO ids carrying any of
 * those categories (primary or secondary). Returns null when no slugs are given
 * so callers can skip the id filter entirely, and an empty array when slugs are
 * given but match nothing (so the result set is correctly empty).
 */
async function ngoIdsForCategorySlugs(
  client: DbClient,
  slugs: string[]
): Promise<string[] | null> {
  const wanted = slugs.map((s) => s.trim()).filter(Boolean)
  if (wanted.length === 0) return null

  const { data: catRows, error: catError } = await client
    .from('categories')
    .select('id')
    .in('slug', wanted)
  if (catError) throw catError

  const categoryIds = ((catRows ?? []) as { id: string }[]).map((c) => c.id)
  if (categoryIds.length === 0) return []

  const { data: pivotRows, error: pivotError } = await client
    .from('ngo_categories')
    .select('ngo_id')
    .in('category_id', categoryIds)
  if (pivotError) throw pivotError

  return Array.from(
    new Set(((pivotRows ?? []) as { ngo_id: string }[]).map((r) => r.ngo_id))
  )
}

/**
 * Free-text search over active NGOs by name, description, or city.
 * Used by the /search results page.
 */
export async function searchNgosByText(
  client: DbClient,
  q: string,
  filters: NgoFilters = {}
): Promise<NGO[]> {
  // Resolve category filter to NGO ids first (many-to-many lookup).
  const categoryNgoIds = await ngoIdsForCategorySlugs(
    client,
    filters.category_slugs ?? []
  )
  if (categoryNgoIds !== null && categoryNgoIds.length === 0) return []

  let query = client
    .from('ngos')
    .select(NGO_SELECT)
    .eq('listing_status', 'Active')

  if (categoryNgoIds !== null) query = query.in('id', categoryNgoIds)

  const term = q.trim()
  if (term) {
    const like = `%${term}%`
    query = query.or(
      `name.ilike.${like},description.ilike.${like},city.ilike.${like}`
    )
  }

  query = applyFilters(query, filters)

  const { data, error } = await query
  if (error) throw error
  return ((data ?? []) as unknown as RawNgo[]).map(toNgo)
}

export type NgoSuggestion = {
  slug: string
  name: string
  primary_category: string
  city: string
}

export type SearchSuggestions = {
  ngos: NgoSuggestion[]
  categories: { name: string; slug: string }[]
  cities: string[]
}

/**
 * Grouped typeahead suggestions used by the homepage and header search.
 * Triggers from a single character. Returns NGO name matches (prefix, ranked
 * by impact score), matching categories, and matching cities.
 */
export async function getSearchSuggestions(
  client: DbClient,
  q: string,
  limit = 8
): Promise<SearchSuggestions> {
  const term = q.trim()
  if (term.length < 1) return { ngos: [], categories: [], cities: [] }

  const prefix = `${term}%`

  const [ngoRes, catRes, cityRes] = await Promise.all([
    client
      .from('ngos')
      .select(
        `slug, name, city,
         ngo_categories ( is_primary, categories ( name ) )`
      )
      .eq('listing_status', 'Active')
      .ilike('name', prefix)
      .order('impact_score', { ascending: false })
      .limit(limit),
    client
      .from('categories')
      .select('name, slug')
      .ilike('name', `%${term}%`)
      .order('name', { ascending: true })
      .limit(3),
    client
      .from('ngos')
      .select('city')
      .eq('listing_status', 'Active')
      .ilike('city', prefix)
      .not('city', 'is', null)
      .limit(40),
  ])

  if (ngoRes.error) throw ngoRes.error

  type RawNgoSug = {
    slug: string
    name: string
    city: string | null
    ngo_categories: Array<{
      is_primary: boolean
      categories: { name: string } | null
    }>
  }

  const ngos: NgoSuggestion[] = ((ngoRes.data ?? []) as unknown as RawNgoSug[]).map(
    (r) => {
      const primary = r.ngo_categories.find((nc) => nc.is_primary)
      return {
        slug: r.slug,
        name: r.name,
        primary_category:
          primary?.categories?.name ??
          r.ngo_categories[0]?.categories?.name ??
          '',
        city: r.city ?? '',
      }
    }
  )

  const categories = (catRes.data ?? []) as { name: string; slug: string }[]

  // Distinct city names (case-insensitive), capped at 3.
  const seen = new Set<string>()
  const cities: string[] = []
  for (const row of (cityRes.data ?? []) as { city: string | null }[]) {
    const c = row.city?.trim()
    if (!c) continue
    const key = c.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    cities.push(c)
    if (cities.length >= 3) break
  }

  return { ngos, categories, cities }
}

export type CategoryCount = { category_id: string; count: number }

/**
 * Count of active NGOs per category, by PRIMARY category, keyed by the
 * categories table UUID. Used to show "N NGOs" on homepage category cards.
 */
export async function getCategoryCounts(
  client: DbClient
): Promise<Record<string, number>> {
  const { data, error } = await client
    .from('ngo_categories')
    .select('category_id, ngos!inner(listing_status)')
    .eq('is_primary', true)
    .eq('ngos.listing_status', 'Active')

  if (error) throw error

  const counts: Record<string, number> = {}
  for (const row of (data ?? []) as { category_id: string }[]) {
    counts[row.category_id] = (counts[row.category_id] ?? 0) + 1
  }
  return counts
}

export type StateWithCount = State & { count: number }

/** Top states by active-NGO count, for the homepage "Browse by State" chips. */
export async function getTopStates(
  client: DbClient,
  limit = 8
): Promise<StateWithCount[]> {
  const [statesRes, ngoRes] = await Promise.all([
    client.from('states').select('*'),
    client
      .from('ngos')
      .select('state_id')
      .eq('listing_status', 'Active')
      .not('state_id', 'is', null),
  ])

  if (statesRes.error) throw statesRes.error
  if (ngoRes.error) throw ngoRes.error

  const counts: Record<string, number> = {}
  for (const row of (ngoRes.data ?? []) as { state_id: string }[]) {
    counts[row.state_id] = (counts[row.state_id] ?? 0) + 1
  }

  return ((statesRes.data ?? []) as State[])
    .map((s) => ({ ...s, count: counts[s.id] ?? 0 }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

// ============================================================
// Category & state queries
// ============================================================

/** Fetch all categories ordered by name. */
export async function getCategories(client: DbClient): Promise<Category[]> {
  const { data, error } = await client
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error

  return (data ?? []) as Category[]
}

/** Fetch all states ordered by name. */
export async function getStates(client: DbClient): Promise<State[]> {
  const { data, error } = await client
    .from('states')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error

  return (data ?? []) as State[]
}

// ============================================================
// Homepage stats
// ============================================================

export type HomeStats = {
  ngoCount: number
  stateCount: number
  categoryCount: number
}

/**
 * Aggregate counts for the homepage stats banner:
 * total active NGOs, distinct states they cover, and total categories.
 */
export async function getHomeStats(client: DbClient): Promise<HomeStats> {
  const [{ count: ngoCount }, { count: categoryCount }, statesRes] =
    await Promise.all([
      client
        .from('ngos')
        .select('id', { count: 'exact', head: true })
        .eq('listing_status', 'Active'),
      client.from('categories').select('id', { count: 'exact', head: true }),
      client
        .from('ngos')
        .select('state_id')
        .eq('listing_status', 'Active')
        .not('state_id', 'is', null),
    ])

  const stateIds = new Set(
    ((statesRes.data ?? []) as { state_id: string | null }[])
      .map((r) => r.state_id)
      .filter(Boolean)
  )

  return {
    ngoCount: ngoCount ?? 0,
    categoryCount: categoryCount ?? 0,
    stateCount: stateIds.size,
  }
}

// ============================================================
// Platform impact stats
// ============================================================

export type ImpactStats = {
  ngoCount: number
  stateCount: number
  categoryCount: number
  beneficiaries: number
  volunteerCount: number
  internshipCount: number
  csrCount: number
  reg80gCount: number
  categoryBreakdown: { name: string; slug: string; count: number }[]
  topStates: StateWithCount[]
}

/** Aggregate platform-wide statistics for the /impact page. */
export async function getImpactStats(client: DbClient): Promise<ImpactStats> {
  const activeCount = (filter: (q: any) => any) => // eslint-disable-line @typescript-eslint/no-explicit-any
    filter(
      client
        .from('ngos')
        .select('id', { count: 'exact', head: true })
        .eq('listing_status', 'Active')
    )

  const [
    ngoRes,
    volunteerRes,
    internshipRes,
    csrRes,
    reg80gRes,
    beneficiariesRes,
    statesRes,
    categories,
    categoryCounts,
    topStates,
  ] = await Promise.all([
    activeCount((q) => q),
    activeCount((q) => q.eq('volunteer_available', true)),
    activeCount((q) => q.eq('internship_available', true)),
    activeCount((q) => q.eq('accepts_csr', true)),
    activeCount((q) => q.eq('is_80g', 'Yes')),
    client
      .from('ngos')
      .select('beneficiaries_count')
      .eq('listing_status', 'Active'),
    client
      .from('ngos')
      .select('state_id')
      .eq('listing_status', 'Active')
      .not('state_id', 'is', null),
    getCategories(client),
    getCategoryCounts(client),
    getTopStates(client, 5),
  ])

  const beneficiaries = (
    (beneficiariesRes.data ?? []) as { beneficiaries_count: number | null }[]
  ).reduce((sum, r) => sum + (r.beneficiaries_count ?? 0), 0)

  const stateCount = new Set(
    ((statesRes.data ?? []) as { state_id: string | null }[])
      .map((r) => r.state_id)
      .filter(Boolean)
  ).size

  const categoryBreakdown = categories
    .map((c) => ({
      name: c.name,
      slug: c.slug,
      count: categoryCounts[c.id] ?? 0,
    }))
    .sort((a, b) => b.count - a.count)

  return {
    ngoCount: ngoRes.count ?? 0,
    stateCount,
    categoryCount: categories.length,
    beneficiaries,
    volunteerCount: volunteerRes.count ?? 0,
    internshipCount: internshipRes.count ?? 0,
    csrCount: csrRes.count ?? 0,
    reg80gCount: reg80gRes.count ?? 0,
    categoryBreakdown,
    topStates,
  }
}

// ============================================================
// NGO profile sub-section queries
// ============================================================

/** Fetch active programs for an NGO profile page. */
export async function getNgoPrograms(
  client: DbClient,
  ngoId: string
): Promise<Program[]> {
  const { data, error } = await client
    .from('programs')
    .select('*')
    .eq('ngo_id', ngoId)
    .eq('status', 'active')
    .order('start_date', { ascending: false })

  if (error) throw error

  return (data ?? []) as Program[]
}

/** Fetch gallery images for an NGO profile page. */
export async function getNgoGallery(
  client: DbClient,
  ngoId: string
): Promise<NgoGallery[]> {
  const { data, error } = await client
    .from('ngo_gallery')
    .select('*')
    .eq('ngo_id', ngoId)
    .order('sort_order', { ascending: true })

  if (error) throw error

  return (data ?? []) as NgoGallery[]
}

export type UserApplication = {
  id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  ngo: { name: string; slug: string } | null
}

/**
 * Fetch a user's volunteer applications, newest first, with the joined NGO
 * name and slug for linking. RLS restricts the result to the caller's own rows.
 */
export async function getUserApplications(
  client: DbClient,
  userId: string
): Promise<UserApplication[]> {
  const { data, error } = await client
    .from('volunteer_applications')
    .select('id, status, created_at, ngos ( name, slug )')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  type Row = {
    id: string
    status: UserApplication['status']
    created_at: string
    ngos: { name: string; slug: string } | null
  }

  return ((data ?? []) as unknown as Row[]).map((r) => ({
    id: r.id,
    status: r.status,
    created_at: r.created_at,
    ngo: r.ngos,
  }))
}

/**
 * Fetch the NGOs a user has bookmarked, newest save first. RLS limits the
 * saved_ngos rows to the caller's own; only active NGOs resolve through the join.
 */
export async function getUserSavedNgos(
  client: DbClient,
  userId: string
): Promise<NGO[]> {
  const { data, error } = await client
    .from('saved_ngos')
    .select(`saved_at, ngos ( ${NGO_SELECT} )`)
    .eq('user_id', userId)
    .order('saved_at', { ascending: false })

  if (error) throw error

  type Row = { ngos: RawNgo | null }
  return ((data ?? []) as unknown as Row[])
    .map((r) => r.ngos)
    .filter((n): n is RawNgo => Boolean(n))
    .map(toNgo)
}

export type PendingReview = {
  id: string
  rating: 1 | 2 | 3 | 4 | 5
  comment: string | null
  created_at: string
  ngo: { name: string; slug: string } | null
}

/**
 * Fetch all unapproved reviews with their NGO name/slug, newest first.
 * Visible only to admins via the "admin manage reviews" RLS policy.
 */
export async function getPendingReviews(
  client: DbClient
): Promise<PendingReview[]> {
  const { data, error } = await client
    .from('reviews')
    .select('id, rating, comment, created_at, ngos ( name, slug )')
    .eq('is_approved', false)
    .order('created_at', { ascending: false })

  if (error) throw error

  type Row = {
    id: string
    rating: PendingReview['rating']
    comment: string | null
    created_at: string
    ngos: { name: string; slug: string } | null
  }

  return ((data ?? []) as unknown as Row[]).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at,
    ngo: r.ngos,
  }))
}

/** Fetch approved reviews for an NGO profile page. */
export async function getNgoReviews(
  client: DbClient,
  ngoId: string
): Promise<Review[]> {
  const { data, error } = await client
    .from('reviews')
    .select('*')
    .eq('ngo_id', ngoId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []) as Review[]
}
