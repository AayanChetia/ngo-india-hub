-- ============================================================
-- 003_indexes.sql
-- Performance indexes for the most common query patterns.
-- ============================================================

-- ngos — slug lookups for /ngo/[slug] profile pages
CREATE INDEX IF NOT EXISTS idx_ngos_slug
  ON ngos (slug);

-- ngos — filter by listing_status (Active / Pending / Inactive)
CREATE INDEX IF NOT EXISTS idx_ngos_listing_status
  ON ngos (listing_status);

-- ngos — filter + join by state
CREATE INDEX IF NOT EXISTS idx_ngos_state_id
  ON ngos (state_id);

-- ngo_categories — all categories for a given NGO
CREATE INDEX IF NOT EXISTS idx_ngo_categories_ngo_id
  ON ngo_categories (ngo_id);

-- ngo_categories — all NGOs in a given category
CREATE INDEX IF NOT EXISTS idx_ngo_categories_category_id
  ON ngo_categories (category_id);

-- programs — all programs belonging to an NGO
CREATE INDEX IF NOT EXISTS idx_programs_ngo_id
  ON programs (ngo_id);
