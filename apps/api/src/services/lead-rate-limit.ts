/**
 * In-memory token-bucket limiter for the public contact form.
 *
 * Final numbers (justified against real volume in docs/report, not guessed):
 *  - per client: 5 submissions / 10 minutes
 *  - global: 120 submissions / 10 minutes, applied to EVERY submission
 *
 * Two failure modes drove this shape:
 *  1. One abuser must not be able to spend the whole global budget: the per-key
 *     bucket stops them at 5, and the first submission of an unseen key is
 *     still allowed so a visitor is never punished by their own burst.
 *  2. An attacker rotating identities must still hit a ceiling: the global
 *     bucket therefore applies to first-time keys too. With ~2 real leads per
 *     month, 120 per 10 minutes (17,280/day) is a ceiling legitimate traffic
 *     cannot reach, while a scripted flood hits it in seconds.
 *
 * Rejections carry a `scope` so the route can log "one abuser" (key) apart from
 * "a flood" (global). The key map is bounded and swept.
 */

export type RateLimitScope = "key" | "global";

export interface RateLimitDecision {
  allowed: boolean;
  retryAfter: number;
  scope?: RateLimitScope;
}

export interface RateLimiter {
  consume(key: string): RateLimitDecision;
  size(): number;
  sweep(now?: number): number;
}

export interface RateLimiterOptions {
  perClientLimit?: number;
  perClientWindowMs?: number;
  globalLimit?: number;
  globalWindowMs?: number;
  maxKeys?: number;
  clock?: () => number;
}

interface Bucket {
  tokens: number;
  updatedAt: number;
}

export const DEFAULT_LIMITS = {
  perClientLimit: 5,
  perClientWindowMs: 10 * 60 * 1000,
  globalLimit: 120,
  globalWindowMs: 10 * 60 * 1000,
  maxKeys: 5000,
} as const;

function refill(bucket: Bucket, limit: number, windowMs: number, now: number): void {
  const elapsed = now - bucket.updatedAt;
  if (elapsed <= 0) {
    bucket.updatedAt = now;
    return;
  }

  const ratePerMs = limit / windowMs;
  bucket.tokens = Math.min(limit, bucket.tokens + elapsed * ratePerMs);
  bucket.updatedAt = now;
}

function secondsUntilNextToken(bucket: Bucket, limit: number, windowMs: number): number {
  const ratePerMs = limit / windowMs;
  const missing = 1 - bucket.tokens;
  return missing <= 0 ? 0 : Math.ceil(missing / ratePerMs / 1000);
}

export function createLeadRateLimiter(options: RateLimiterOptions = {}): RateLimiter {
  const perClientLimit = options.perClientLimit ?? DEFAULT_LIMITS.perClientLimit;
  const perClientWindowMs = options.perClientWindowMs ?? DEFAULT_LIMITS.perClientWindowMs;
  const globalLimit = options.globalLimit ?? DEFAULT_LIMITS.globalLimit;
  const globalWindowMs = options.globalWindowMs ?? DEFAULT_LIMITS.globalWindowMs;
  const maxKeys = options.maxKeys ?? DEFAULT_LIMITS.maxKeys;
  const clock = options.clock ?? (() => Date.now());

  const buckets = new Map<string, Bucket>();
  const globalBucket: Bucket = { tokens: globalLimit, updatedAt: clock() };
  let operationsSinceSweep = 0;

  function sweep(now = clock()): number {
    let removed = 0;
    for (const [key, bucket] of buckets) {
      refill(bucket, perClientLimit, perClientWindowMs, now);
      if (bucket.tokens >= perClientLimit) {
        buckets.delete(key);
        removed += 1;
      }
    }
    return removed;
  }

  function maybeSweep(now: number): void {
    operationsSinceSweep += 1;
    if (operationsSinceSweep >= 256) {
      operationsSinceSweep = 0;
      sweep(now);
    }
  }

  function makeRoomForNewKey(now: number): void {
    if (buckets.size < maxKeys) {
      return;
    }

    sweep(now);
    while (buckets.size >= maxKeys) {
      const oldest = buckets.keys().next();
      if (oldest.done) {
        return;
      }
      buckets.delete(oldest.value);
    }
  }

  function consume(key: string): RateLimitDecision {
    const now = clock();

    refill(globalBucket, globalLimit, globalWindowMs, now);

    // Global ceiling first: it applies to every submission, including the first
    // one from an unseen key, so rotating identities cannot create unbounded
    // rows. A refusal here does not consume the client's own bucket.
    if (globalBucket.tokens < 1) {
      return {
        allowed: false,
        retryAfter: Math.max(1, secondsUntilNextToken(globalBucket, globalLimit, globalWindowMs)),
        scope: "global",
      };
    }

    const existing = buckets.get(key);

    if (!existing) {
      // A visitor's first submission is never refused by their own (empty)
      // bucket: only the global ceiling above can stop it.
      makeRoomForNewKey(now);
      buckets.set(key, { tokens: perClientLimit - 1, updatedAt: now });
      globalBucket.tokens -= 1;
      maybeSweep(now);

      return { allowed: true, retryAfter: 0 };
    }

    refill(existing, perClientLimit, perClientWindowMs, now);

    if (existing.tokens < 1) {
      return {
        allowed: false,
        retryAfter: Math.max(1, secondsUntilNextToken(existing, perClientLimit, perClientWindowMs)),
        scope: "key",
      };
    }

    existing.tokens -= 1;
    globalBucket.tokens -= 1;
    maybeSweep(now);

    return { allowed: true, retryAfter: 0 };
  }

  return {
    consume,
    size: () => buckets.size,
    sweep,
  };
}
