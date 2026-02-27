CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  github_id     INTEGER UNIQUE NOT NULL,
  username      TEXT UNIQUE NOT NULL,
  display_name  TEXT,
  avatar_url    TEXT,
  email         TEXT,
  role          TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','admin')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT UNIQUE NOT NULL,
  label       TEXT NOT NULL,
  description TEXT,
  icon        TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS skills (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT UNIQUE NOT NULL,
  display_name    TEXT NOT NULL,
  description     TEXT NOT NULL,
  author_id       INTEGER NOT NULL REFERENCES users(id),
  category_id     INTEGER REFERENCES categories(id),
  license         TEXT DEFAULT 'MIT',
  homepage        TEXT,
  official        INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK(status IN ('pending','approved','rejected','unlisted')),
  featured        INTEGER NOT NULL DEFAULT 0,
  download_count  INTEGER NOT NULL DEFAULT 0,
  avg_rating      REAL NOT NULL DEFAULT 0,
  rating_count    INTEGER NOT NULL DEFAULT 0,
  latest_version  TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_skills_status ON skills(status);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category_id);
CREATE INDEX IF NOT EXISTS idx_skills_author ON skills(author_id);

CREATE TABLE IF NOT EXISTS versions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_id    INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  version     TEXT NOT NULL,
  readme_md   TEXT,
  metadata    TEXT,
  tarball_path TEXT NOT NULL,
  file_size   INTEGER,
  checksum    TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(skill_id, version)
);

CREATE INDEX IF NOT EXISTS idx_versions_skill ON versions(skill_id);

CREATE TABLE IF NOT EXISTS reviews (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_id    INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  rating      INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  title       TEXT,
  body        TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(skill_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_skill ON reviews(skill_id);

CREATE TABLE IF NOT EXISTS user_installs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  skill_id    INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  version     TEXT NOT NULL,
  installed_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, skill_id)
);
