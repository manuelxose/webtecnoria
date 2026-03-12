-- Migration 005: Finance — Contracts, Invoices, Invoice Items, Payments
-- Run after 004_projects.sql

BEGIN;

-- ─── CONTRACTS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contracts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft','sent','signed','cancelled')),
  amount       NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency     CHAR(3) NOT NULL DEFAULT 'EUR',
  start_date   DATE,
  end_date     DATE,
  signed_at    TIMESTAMPTZ,
  file_url     TEXT,
  notes        TEXT,
  client_id    UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  project_id   UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contracts_client  ON contracts (client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status  ON contracts (status);
CREATE INDEX IF NOT EXISTS idx_contracts_project ON contracts (project_id);

-- ─── INVOICES ─────────────────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

CREATE TABLE IF NOT EXISTS invoices (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number        TEXT NOT NULL UNIQUE
                  DEFAULT ('INV-' || to_char(NOW(), 'YYYY') || '-' || lpad(nextval('invoice_number_seq')::text, 4, '0')),
  status        TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','sent','viewed','paid','overdue','cancelled')),
  issue_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date      DATE,
  subtotal      NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate      NUMERIC(5,2) NOT NULL DEFAULT 21,
  tax_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,
  total         NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency      CHAR(3) NOT NULL DEFAULT 'EUR',
  notes         TEXT,
  paid_at       TIMESTAMPTZ,
  client_id     UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  project_id    UUID REFERENCES projects(id) ON DELETE SET NULL,
  contract_id   UUID REFERENCES contracts(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_client   ON invoices (client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status   ON invoices (status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices (due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_project  ON invoices (project_id);

-- ─── INVOICE ITEMS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoice_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  quantity    NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price  NUMERIC(12,2) NOT NULL DEFAULT 0,
  total       NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  invoice_id  UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items (invoice_id);

-- ─── PAYMENTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount      NUMERIC(12,2) NOT NULL,
  currency    CHAR(3) NOT NULL DEFAULT 'EUR',
  method      TEXT NOT NULL DEFAULT 'bank_transfer'
                CHECK (method IN ('bank_transfer','card','cash','other')),
  reference   TEXT,
  notes       TEXT,
  paid_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invoice_id  UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments (invoice_id);

-- ─── updated_at triggers ──────────────────────────────────────────────────────
DO $$
DECLARE tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['contracts','invoices']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'trg_' || tbl || '_updated_at'
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
