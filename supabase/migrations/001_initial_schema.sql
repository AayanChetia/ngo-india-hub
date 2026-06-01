-- ============================================================
-- 001_initial_schema.sql
-- Tables are created in dependency order so foreign keys resolve.
-- ============================================================

-- Trigger function shared by all tables with updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- states (no foreign-key dependencies)
-- ------------------------------------------------------------
CREATE TABLE states (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name    text UNIQUE NOT NULL,
  code    text UNIQUE NOT NULL,
  region  text
);

-- ------------------------------------------------------------
-- categories (self-referencing parent_id is nullable, so safe)
-- ------------------------------------------------------------
CREATE TABLE categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id text UNIQUE NOT NULL,
  name        text NOT NULL,
  slug        text UNIQUE NOT NULL,
  icon        text,
  description text,
  parent_id   uuid REFERENCES categories(id)
);

-- ------------------------------------------------------------
-- ngos (depends on states)
-- ------------------------------------------------------------
CREATE TABLE ngos (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id                text UNIQUE NOT NULL,
  slug                  text UNIQUE NOT NULL,
  name                  text NOT NULL,
  description           text,
  long_description      text,
  website               text,
  email                 text,
  phone                 text,
  logo_url              text,
  social_links          jsonb DEFAULT '{}',
  founded_year          int,
  state_id              uuid REFERENCES states(id),
  city                  text,
  address               text,
  pincode               text,
  registration_number   text,
  is_80g                text DEFAULT 'Verify',
  is_12a                text DEFAULT 'Verify',
  is_fcra               text DEFAULT 'Verify',
  is_verified           boolean DEFAULT false,
  listing_status        text DEFAULT 'Pending',
  volunteer_available   boolean DEFAULT false,
  internship_available  boolean DEFAULT false,
  donation_available    boolean DEFAULT false,
  accepts_csr           boolean DEFAULT false,
  team_size             text,
  funding_type          text,
  beneficiaries_count   bigint,
  impact_score          int CHECK (impact_score BETWEEN 1 AND 10),
  last_verified_at      date,
  source_url            text,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

CREATE TRIGGER update_ngos_updated_at
  BEFORE UPDATE ON ngos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- ngo_categories (depends on ngos, categories)
-- ------------------------------------------------------------
CREATE TABLE ngo_categories (
  ngo_id      uuid REFERENCES ngos(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  is_primary  boolean DEFAULT false,
  PRIMARY KEY (ngo_id, category_id)
);

-- ------------------------------------------------------------
-- programs (depends on ngos)
-- ------------------------------------------------------------
CREATE TABLE programs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id        uuid REFERENCES ngos(id) ON DELETE CASCADE,
  title         text NOT NULL,
  description   text,
  beneficiaries int,
  status        text DEFAULT 'active',
  start_date    date,
  end_date      date,
  created_at    timestamptz DEFAULT now()
);

-- ------------------------------------------------------------
-- users (depends on auth.users managed by Supabase Auth)
-- ------------------------------------------------------------
CREATE TABLE users (
  id         uuid PRIMARY KEY REFERENCES auth.users(id),
  name       text,
  email      text UNIQUE,
  role       text DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

-- ------------------------------------------------------------
-- ngo_admins — maps users to the NGOs they administer.
-- Referenced by the RLS policy on ngos.
-- ------------------------------------------------------------
CREATE TABLE ngo_admins (
  ngo_id  uuid REFERENCES ngos(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (ngo_id, user_id)
);

-- ------------------------------------------------------------
-- volunteer_applications (depends on users, ngos, programs)
-- ------------------------------------------------------------
CREATE TABLE volunteer_applications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES users(id),
  ngo_id     uuid REFERENCES ngos(id),
  program_id uuid REFERENCES programs(id),
  message    text,
  status     text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- ------------------------------------------------------------
-- reviews (depends on users, ngos)
-- ------------------------------------------------------------
CREATE TABLE reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES users(id),
  ngo_id      uuid REFERENCES ngos(id),
  rating      int CHECK (rating BETWEEN 1 AND 5),
  comment     text,
  is_approved boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- ------------------------------------------------------------
-- ngo_gallery (depends on ngos)
-- ------------------------------------------------------------
CREATE TABLE ngo_gallery (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id     uuid REFERENCES ngos(id) ON DELETE CASCADE,
  image_url  text NOT NULL,
  caption    text,
  sort_order int DEFAULT 0
);
