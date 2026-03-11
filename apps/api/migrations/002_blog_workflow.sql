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

UPDATE blog_posts
SET status = 'publish',
    published_at = COALESCE(published_at, created_at)
WHERE status IS DISTINCT FROM 'publish'
   OR published_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published_at
  ON blog_posts(status, published_at DESC, created_at DESC);
