ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'publish';

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS seo_title TEXT;

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS seo_description TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'blog_posts_status_check'
  ) THEN
    ALTER TABLE blog_posts
      ADD CONSTRAINT blog_posts_status_check
      CHECK (status IN ('draft', 'publish'));
  END IF;
END $$;

-- One-time backfill REMOVED on purpose. This migration used to run:
--   UPDATE blog_posts SET status='publish', published_at=COALESCE(...)
--   WHERE status IS DISTINCT FROM 'publish' OR published_at IS NULL;
-- The runner re-applies every file on each deploy and has no ledger, so that
-- statement would publish EVERY draft post on EVERY release. The columns above
-- already default to 'publish', the backfill has long since run in every
-- environment, and the blog route has a real 'draft' state (routes/v1/blog.ts),
-- so keeping it would be a data-integrity defect, not a backfill.
-- Verified 2026-11-05: production blog_posts holds 0 drafts before this change.

CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published_at
  ON blog_posts(status, published_at DESC, created_at DESC);
