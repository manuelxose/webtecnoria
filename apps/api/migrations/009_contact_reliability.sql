-- Migration 009: contact reliability
--
-- Additive and idempotent on purpose: migrations are re-applied on every deploy
-- and there is no ledger table, so every statement must be safe to run again.
-- This file contains NO data UPDATE: existing rows keep their history and are
-- marked 'legacy' by the column DEFAULT, which is what prevents the 17 leads
-- that predate this change from ever being re-notified.

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS source_page text;

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS idempotency_key text;

-- Pre-existing rows become 'legacy' (never notified, never re-notified).
-- The insert path sets 'pending' explicitly for new leads.
ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS notification_status text NOT NULL DEFAULT 'legacy';

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS notification_attempts int NOT NULL DEFAULT 0;

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS notified_at timestamptz;

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS notification_error text;

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS client_hash text;

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS privacy_accepted boolean NOT NULL DEFAULT false;

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS user_agent_class text;

-- Idempotency: partial unique index so NULL keys (clients that do not send one)
-- never collide with each other.
CREATE UNIQUE INDEX IF NOT EXISTS idx_contact_messages_idempotency_key
  ON contact_messages (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- Operator queries: "what still needs a notification, oldest first".
CREATE INDEX IF NOT EXISTS idx_contact_messages_notification
  ON contact_messages (notification_status, created_at);
