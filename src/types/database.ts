// ============================================================
// Raw DB row types — one per table, columns match SQL schema exactly.
// ============================================================

export type NgoRow = {
  id: string
  ngo_id: string
  slug: string
  name: string
  description: string | null
  long_description: string | null
  website: string | null
  email: string | null
  phone: string | null
  logo_url: string | null
  social_links: Record<string, string>
  founded_year: number | null
  state_id: string | null
  city: string | null
  address: string | null
  pincode: string | null
  registration_number: string | null
  is_80g: 'Yes' | 'No' | 'Verify'
  is_12a: 'Yes' | 'No' | 'Verify'
  is_fcra: 'Yes' | 'No' | 'Verify'
  is_verified: boolean
  listing_status: 'Active' | 'Pending' | 'Inactive'
  volunteer_available: boolean
  internship_available: boolean
  donation_available: boolean
  accepts_csr: boolean
  team_size: string | null
  funding_type: string | null
  beneficiaries_count: number | null
  impact_score: number | null
  last_verified_at: string | null
  source_url: string | null
  created_at: string
  updated_at: string
}

export type CategoryRow = {
  id: string
  category_id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  parent_id: string | null
}

export type StateRow = {
  id: string
  name: string
  code: string
  region: string | null
}

export type NgoCategoryRow = {
  ngo_id: string
  category_id: string
  is_primary: boolean
}

export type ProgramRow = {
  id: string
  ngo_id: string
  title: string
  description: string | null
  beneficiaries: number | null
  status: 'active' | 'completed' | 'upcoming'
  start_date: string | null
  end_date: string | null
  created_at: string
}

export type UserRow = {
  id: string
  name: string | null
  email: string | null
  role: 'user' | 'ngo_admin' | 'admin'
  created_at: string
}

export type NgoAdminRow = {
  ngo_id: string
  user_id: string
}

export type VolunteerApplicationRow = {
  id: string
  user_id: string | null
  ngo_id: string | null
  program_id: string | null
  message: string | null
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

export type ReviewRow = {
  id: string
  user_id: string | null
  ngo_id: string | null
  rating: 1 | 2 | 3 | 4 | 5
  comment: string | null
  is_approved: boolean
  created_at: string
}

export type NgoGalleryRow = {
  id: string
  ngo_id: string
  image_url: string
  caption: string | null
  sort_order: number
}

// ============================================================
// Insert types — auto-generated columns are optional on insert.
// ============================================================

export type NgoInsert = Omit<NgoRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type CategoryInsert = Omit<CategoryRow, 'id'> & { id?: string }

export type StateInsert = Omit<StateRow, 'id'> & { id?: string }

export type ProgramInsert = Omit<ProgramRow, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type UserInsert = Omit<UserRow, 'created_at'> & { created_at?: string }

export type VolunteerApplicationInsert = Omit<
  VolunteerApplicationRow,
  'id' | 'created_at'
> & { id?: string; created_at?: string }

export type ReviewInsert = Omit<ReviewRow, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type NgoGalleryInsert = Omit<NgoGalleryRow, 'id'> & { id?: string }

// ============================================================
// NGO — application-level type used throughout the UI.
// Includes joined fields (state name, primary_category) resolved
// from the states and ngo_categories tables.
// Defined exactly as specified in PROJECT_OVERVIEW.md §16.
// ============================================================

export type NGO = {
  id: string
  ngo_id: string
  slug: string
  name: string
  description: string | null
  long_description: string | null
  primary_category: string
  state: string
  city: string
  is_80g: 'Yes' | 'No' | 'Verify'
  is_12a: 'Yes' | 'No' | 'Verify'
  is_fcra: 'Yes' | 'No' | 'Verify'
  is_verified: boolean
  listing_status: 'Active' | 'Pending' | 'Inactive'
  volunteer_available: boolean
  internship_available: boolean
  donation_available: boolean
  accepts_csr: boolean
  impact_score: number
  beneficiaries_count: number | null
  social_links: Record<string, string>
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  category_id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  parent_id: string | null
}

export type State = {
  id: string
  name: string
  code: string
  region: string | null
}

export type Program = {
  id: string
  ngo_id: string
  title: string
  description: string | null
  beneficiaries: number | null
  status: 'active' | 'completed' | 'upcoming'
  start_date: string | null
  end_date: string | null
  created_at: string
}

export type User = {
  id: string
  name: string | null
  email: string | null
  role: 'user' | 'ngo_admin' | 'admin'
  created_at: string
}

export type VolunteerApplication = {
  id: string
  user_id: string | null
  ngo_id: string | null
  program_id: string | null
  message: string | null
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

export type Review = {
  id: string
  user_id: string | null
  ngo_id: string | null
  rating: 1 | 2 | 3 | 4 | 5
  comment: string | null
  is_approved: boolean
  created_at: string
}

export type NgoGallery = {
  id: string
  ngo_id: string
  image_url: string
  caption: string | null
  sort_order: number
}

// ============================================================
// Database — typed interface for the Supabase client.
// Usage: createClient<Database>(url, key)
// ============================================================

export type Database = {
  public: {
    Tables: {
      ngos: {
        Row: NgoRow
        Insert: NgoInsert
        Update: Partial<NgoInsert>
      }
      categories: {
        Row: CategoryRow
        Insert: CategoryInsert
        Update: Partial<CategoryInsert>
      }
      states: {
        Row: StateRow
        Insert: StateInsert
        Update: Partial<StateInsert>
      }
      ngo_categories: {
        Row: NgoCategoryRow
        Insert: NgoCategoryRow
        Update: Partial<NgoCategoryRow>
      }
      programs: {
        Row: ProgramRow
        Insert: ProgramInsert
        Update: Partial<ProgramInsert>
      }
      users: {
        Row: UserRow
        Insert: UserInsert
        Update: Partial<UserInsert>
      }
      ngo_admins: {
        Row: NgoAdminRow
        Insert: NgoAdminRow
        Update: Partial<NgoAdminRow>
      }
      volunteer_applications: {
        Row: VolunteerApplicationRow
        Insert: VolunteerApplicationInsert
        Update: Partial<VolunteerApplicationInsert>
      }
      reviews: {
        Row: ReviewRow
        Insert: ReviewInsert
        Update: Partial<ReviewInsert>
      }
      ngo_gallery: {
        Row: NgoGalleryRow
        Insert: NgoGalleryInsert
        Update: Partial<NgoGalleryInsert>
      }
    }
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_ngo_admin: {
        Args: { p_ngo_id: string }
        Returns: boolean
      }
    }
  }
}
