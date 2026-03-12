-- Migration 003: CRM Core — Leads, Clients, Companies, Contacts
-- Run after 002_auth_upgrade.sql

BEGIN;

-- ─── COMPANIES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  domain       TEXT,
  sector       TEXT,
  size         TEXT,
  website      TEXT,
  linkedin_url TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_name ON companies (name);

-- ─── LEADS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  phone          TEXT,
  company_name   TEXT,
  source         TEXT NOT NULL DEFAULT 'manual'
                   CHECK (source IN ('web_form','manual','import','referral','talkaris','auctorio','other')),
  status         TEXT NOT NULL DEFAULT 'new'
                   CHECK (status IN ('new','contacted','qualified','proposal','negotiation','won','lost')),
  score          SMALLINT NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  notes          TEXT,
  utm_source     TEXT,
  utm_medium     TEXT,
  utm_campaign   TEXT,
  assigned_to    UUID REFERENCES users(id) ON DELETE SET NULL,
  converted_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_status    ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_email     ON leads (email);
CREATE INDEX IF NOT EXISTS idx_leads_assigned  ON leads (assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_created   ON leads (created_at DESC);

-- ─── CLIENTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  type           TEXT NOT NULL DEFAULT 'company'
                   CHECK (type IN ('company','individual')),
  status         TEXT NOT NULL DEFAULT 'active'
                   CHECK (status IN ('active','inactive','churned')),
  tier           TEXT NOT NULL DEFAULT 'starter'
                   CHECK (tier IN ('starter','professional','enterprise')),
  billing_email  TEXT,
  fiscal_name    TEXT,
  tax_id         TEXT,
  address        TEXT,
  country        TEXT DEFAULT 'ES',
  city           TEXT,
  website        TEXT,
  notes          TEXT,
  tags           TEXT[] NOT NULL DEFAULT '{}',
  lead_id        UUID REFERENCES leads(id) ON DELETE SET NULL,
  company_id     UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_status  ON clients (status);
CREATE INDEX IF NOT EXISTS idx_clients_tier    ON clients (tier);
CREATE INDEX IF NOT EXISTS idx_clients_name    ON clients (name);

-- ─── CONTACTS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name   TEXT NOT NULL,
  last_name    TEXT NOT NULL DEFAULT '',
  email        TEXT,
  phone        TEXT,
  role         TEXT,
  is_primary   BOOLEAN NOT NULL DEFAULT FALSE,
  notes        TEXT,
  client_id    UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  company_id   UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_client  ON contacts (client_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email   ON contacts (email);

-- ─── updated_at triggers ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$
DECLARE tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['companies','leads','clients','contacts']
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
