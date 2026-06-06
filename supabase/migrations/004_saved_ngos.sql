-- ============================================================
-- 004_saved_ngos.sql
-- Bookmarks: a user can save NGOs to revisit from their profile.
-- ============================================================

CREATE TABLE saved_ngos (
  user_id  uuid REFERENCES users(id) ON DELETE CASCADE,
  ngo_id   uuid REFERENCES ngos(id) ON DELETE CASCADE,
  saved_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, ngo_id)
);

ALTER TABLE saved_ngos ENABLE ROW LEVEL SECURITY;

-- A user can read, insert, and delete only their own bookmarks.
CREATE POLICY "users manage own saved ngos"
  ON saved_ngos FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Tell PostgREST to reload its schema cache so the new table is immediately
-- visible to the REST API (needed when applying via a direct DB connection).
NOTIFY pgrst, 'reload schema';
