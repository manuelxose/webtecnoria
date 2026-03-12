-- Migration 006: Support — Tickets & Messages
-- Run after 005_finance.sql

BEGIN;

-- ─── TICKETS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number       SERIAL UNIQUE,
  title        TEXT NOT NULL,
  description  TEXT,
  status       TEXT NOT NULL DEFAULT 'open'
                 CHECK (status IN ('open','in_progress','waiting','resolved','closed')),
  priority     TEXT NOT NULL DEFAULT 'medium'
                 CHECK (priority IN ('low','medium','high','critical')),
  category     TEXT NOT NULL DEFAULT 'general'
                 CHECK (category IN ('general','bug','feature','billing','access','other')),
  source       TEXT NOT NULL DEFAULT 'manual'
                 CHECK (source IN ('manual','email','portal','talkaris','other')),
  client_id    UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id   UUID REFERENCES projects(id) ON DELETE SET NULL,
  assigned_to  UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tickets_client_id_idx  ON tickets(client_id);
CREATE INDEX IF NOT EXISTS tickets_status_idx     ON tickets(status);
CREATE INDEX IF NOT EXISTS tickets_priority_idx   ON tickets(priority);
CREATE INDEX IF NOT EXISTS tickets_created_at_idx ON tickets(created_at DESC);

CREATE TRIGGER trg_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── TICKET MESSAGES ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_type TEXT NOT NULL DEFAULT 'admin'
                CHECK (author_type IN ('admin','client','system')),
  author_name TEXT,
  content     TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ticket_messages_ticket_id_idx ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS ticket_messages_created_at_idx ON ticket_messages(created_at);

COMMIT;
