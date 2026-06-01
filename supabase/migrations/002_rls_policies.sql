-- ============================================================
-- 002_rls_policies.sql
-- Enable RLS on every table and define access policies.
-- ============================================================

-- Helper: true when the calling user has role = 'admin'
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: true when the calling user is an admin for the given NGO
CREATE OR REPLACE FUNCTION is_ngo_admin(p_ngo_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ngo_admins
    WHERE ngo_id = p_ngo_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================
-- ngos
-- ============================================================
ALTER TABLE ngos ENABLE ROW LEVEL SECURITY;

-- From PROJECT_OVERVIEW.md §6 — public can read active listings
CREATE POLICY "public read active ngos"
  ON ngos FOR SELECT
  USING (listing_status = 'Active');

-- Admins can read every listing regardless of status
CREATE POLICY "admin read all ngos"
  ON ngos FOR SELECT
  USING (is_admin());

-- From PROJECT_OVERVIEW.md §6 — NGO admins can update their own record
CREATE POLICY "ngo admin update own"
  ON ngos FOR UPDATE
  USING (id IN (
    SELECT ngo_id FROM ngo_admins WHERE user_id = auth.uid()
  ));

-- Only admins can insert or delete NGO records
CREATE POLICY "admin insert ngos"
  ON ngos FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "admin delete ngos"
  ON ngos FOR DELETE
  USING (is_admin());

-- ============================================================
-- categories
-- ============================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "admin manage categories"
  ON categories FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- states
-- ============================================================
ALTER TABLE states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read states"
  ON states FOR SELECT
  USING (true);

CREATE POLICY "admin manage states"
  ON states FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- ngo_categories
-- ============================================================
ALTER TABLE ngo_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read ngo_categories"
  ON ngo_categories FOR SELECT
  USING (true);

CREATE POLICY "ngo admin manage own categories"
  ON ngo_categories FOR ALL
  USING (is_ngo_admin(ngo_id))
  WITH CHECK (is_ngo_admin(ngo_id));

CREATE POLICY "admin manage ngo_categories"
  ON ngo_categories FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- programs
-- ============================================================
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read programs"
  ON programs FOR SELECT
  USING (
    ngo_id IN (SELECT id FROM ngos WHERE listing_status = 'Active')
  );

CREATE POLICY "ngo admin manage own programs"
  ON programs FOR ALL
  USING (is_ngo_admin(ngo_id))
  WITH CHECK (is_ngo_admin(ngo_id));

CREATE POLICY "admin manage programs"
  ON programs FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- users
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "users update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "admin read all users"
  ON users FOR SELECT
  USING (is_admin());

CREATE POLICY "admin manage users"
  ON users FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- ngo_admins
-- ============================================================
ALTER TABLE ngo_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ngo admins read own assignments"
  ON ngo_admins FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "admin manage ngo_admins"
  ON ngo_admins FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- volunteer_applications
-- ============================================================
ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own applications"
  ON volunteer_applications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "users submit applications"
  ON volunteer_applications FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "ngo admin read applications for own ngo"
  ON volunteer_applications FOR SELECT
  USING (is_ngo_admin(ngo_id));

CREATE POLICY "ngo admin update application status"
  ON volunteer_applications FOR UPDATE
  USING (is_ngo_admin(ngo_id));

CREATE POLICY "admin manage applications"
  ON volunteer_applications FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- reviews
-- ============================================================
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read approved reviews"
  ON reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "users read own reviews"
  ON reviews FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "users submit reviews"
  ON reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "admin manage reviews"
  ON reviews FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- ngo_gallery
-- ============================================================
ALTER TABLE ngo_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read gallery for active ngos"
  ON ngo_gallery FOR SELECT
  USING (
    ngo_id IN (SELECT id FROM ngos WHERE listing_status = 'Active')
  );

CREATE POLICY "ngo admin manage own gallery"
  ON ngo_gallery FOR ALL
  USING (is_ngo_admin(ngo_id))
  WITH CHECK (is_ngo_admin(ngo_id));

CREATE POLICY "admin manage gallery"
  ON ngo_gallery FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
