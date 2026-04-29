-- =========================
-- Extensions
-- =========================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- USERS TABLE
-- =========================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- AREAS TABLE
-- =========================
CREATE TABLE areas (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  current_status VARCHAR(3) NOT NULL DEFAULT 'OFF'
    CHECK (current_status IN ('ON', 'OFF')),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- REPORTS TABLE
-- =========================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  area_id INT NOT NULL
    REFERENCES areas(id) ON DELETE CASCADE,

  user_id UUID NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,

  status VARCHAR(3) NOT NULL
    CHECK (status IN ('ON', 'OFF')),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- FOLLOWS TABLE
-- =========================
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,

  area_id INT NOT NULL
    REFERENCES areas(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, area_id)
);

-- =========================
-- NOTIFICATIONS TABLE
-- =========================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,

  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- INDEXES (Performance)
-- =========================
CREATE INDEX idx_reports_area_id ON reports(area_id);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_follows_user_id ON follows(user_id);
CREATE INDEX idx_follows_area_id ON follows(area_id);

-- =========================
-- SEED DATA (AREAS)
-- =========================
INSERT INTO areas (name, city, current_status) VALUES
  ('Engineering', 'UNILAG', 'OFF'),
  ('Art', 'UNILAG', 'OFF'),
  ('Social Science', 'UNILAG', 'OFF'),
  ('Management Science', 'UNILAG', 'OFF'),
  ('Law', 'UNILAG', 'OFF'),
  ('Education', 'UNILAG', 'OFF'),
  ('Architecture', 'UNILAG', 'OFF'),
  ('Environmental Science', 'UNILAG' 'OFF');
  ('Science', 'UNILAG', 'OFF');