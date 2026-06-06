-- ============================================================
-- 005_reviews_rls.sql
-- Public reads approved reviews; logged-in users insert their own.
-- Idempotent — these policies may already exist from 002_rls_policies.sql.
-- ============================================================

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read approved reviews" ON reviews;
CREATE POLICY "public read approved reviews"
  ON reviews FOR SELECT
  USING (is_approved = true);

DROP POLICY IF EXISTS "users insert own review" ON reviews;
CREATE POLICY "users insert own review"
  ON reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Refresh the PostgREST schema cache so policy changes take effect immediately.
NOTIFY pgrst, 'reload schema';
