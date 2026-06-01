import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Database,
  NGO,
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

/** Fetch all active NGOs belonging to a category (identified by slug). */
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
