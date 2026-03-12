-- Migration 008: Client Portal — portal access tokens
-- Run after 007_users_upgrade.sql

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS portal_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  label       TEXT NOT NULL DEFAULT 'Acceso portal',
  expires_at  TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  revoked     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portal_tokens_client_id_idx ON portal_tokens(client_id);
CREATE INDEX IF NOT EXISTS portal_tokens_token_idx     ON portal_tokens(token);

COMMIT;
