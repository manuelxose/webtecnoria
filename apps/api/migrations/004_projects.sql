-- Migration 004: Projects, Milestones, Tasks
-- Run after 003_crm_core.sql

BEGIN;

-- ─── PROJECTS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  description      TEXT,
  type             TEXT NOT NULL DEFAULT 'custom'
                     CHECK (type IN ('web_dev','automation','ai_system','chatbot','saas','consulting','custom')),
  status           TEXT NOT NULL DEFAULT 'discovery'
                     CHECK (status IN ('discovery','planning','active','paused','review','completed','cancelled')),
  priority         TEXT NOT NULL DEFAULT 'medium'
                     CHECK (priority IN ('low','medium','high','critical')),
  health           TEXT NOT NULL DEFAULT 'on_track'
                     CHECK (health IN ('on_track','at_risk','off_track')),
  start_date       DATE,
  end_date         DATE,
  deadline         DATE,
  budget           NUMERIC(12,2),
  invoiced_amount  NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes            TEXT,
  client_id        UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  lead_id          UUID REFERENCES leads(id) ON DELETE SET NULL,
  created_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_status    ON projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_client    ON projects (client_id);
CREATE INDEX IF NOT EXISTS idx_projects_health    ON projects (health);
CREATE INDEX IF NOT EXISTS idx_projects_deadline  ON projects (deadline);

-- ─── MILESTONES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS milestones (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','in_progress','completed','cancelled')),
  due_date     DATE,
  completed_at TIMESTAMPTZ,
  sort_order   SMALLINT NOT NULL DEFAULT 0,
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_milestones_project ON milestones (project_id);

-- ─── TASKS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  description      TEXT,
  status           TEXT NOT NULL DEFAULT 'backlog'
                     CHECK (status IN ('backlog','todo','in_progress','review','done')),
  priority         TEXT NOT NULL DEFAULT 'medium'
                     CHECK (priority IN ('low','medium','high','critical')),
  due_date         DATE,
  estimated_hours  NUMERIC(6,2),
  actual_hours     NUMERIC(6,2),
  sort_order       SMALLINT NOT NULL DEFAULT 0,
  project_id       UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id     UUID REFERENCES milestones(id) ON DELETE SET NULL,
  assigned_to      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_project    ON tasks (project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status     ON tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned   ON tasks (assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone  ON tasks (milestone_id);

-- ─── updated_at triggers ─────────────────────────────────────────────────────
DO $$
DECLARE tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['projects','milestones','tasks']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname = 'trg_' || tbl || '_updated_at'
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER trg_%I_updated_at
         BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
        tbl, tbl
      );
    END IF;
  END LOOP;
END;
$$;

COMMIT;
