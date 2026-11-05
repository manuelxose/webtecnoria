// Token bucket behaviour: limit real floods, never punish a first visitor's own
// burst, but keep a ceiling that rotating identities cannot escape.
import assert from "node:assert/strict";
import test from "node:test";

import "./helpers.mjs";

const { createLeadRateLimiter, DEFAULT_LIMITS } = await import("../../apps/api/src/services/lead-rate-limit.js");

function limiterAt(startMs) {
  let now = startMs;
  const limiter = createLeadRateLimiter({
    perClientLimit: 5,
    perClientWindowMs: 10 * 60 * 1000,
    globalLimit: 120,
    globalWindowMs: 10 * 60 * 1000,
    maxKeys: 100,
    clock: () => now,
  });

  return { limiter, tick: (ms) => { now += ms; } };
}

test("defaults: 5 per client per 10 min, 120 globally per 10 min", () => {
  assert.equal(DEFAULT_LIMITS.perClientLimit, 5);
  assert.equal(DEFAULT_LIMITS.perClientWindowMs, 10 * 60 * 1000);
  assert.equal(DEFAULT_LIMITS.globalLimit, 120);
  assert.equal(DEFAULT_LIMITS.globalWindowMs, 10 * 60 * 1000);
});

test("allows 5 per client, refuses the 6th with scope 'key'", () => {
  const { limiter } = limiterAt(1_700_000_000_000);

  for (let attempt = 1; attempt <= 5; attempt++) {
    const decision = limiter.consume("client-a");
    assert.equal(decision.allowed, true, `attempt ${attempt} must pass`);
  }

  const sixth = limiter.consume("client-a");
  assert.equal(sixth.allowed, false);
  assert.equal(sixth.scope, "key");
  assert.ok(sixth.retryAfter > 0 && sixth.retryAfter <= 120, `retryAfter=${sixth.retryAfter}`);
});

test("a first submission is allowed while the global budget lasts", () => {
  const { limiter } = limiterAt(1_700_000_000_000);
  assert.equal(limiter.consume("brand-new-visitor").allowed, true);
});

test("the global ceiling applies to first-time keys too (rotating identities)", () => {
  const { limiter } = limiterAt(1_700_000_000_000);

  // 120 distinct identities: each is a first submission, each consumes one
  // global token. The 121st must be refused globally.
  for (let identity = 0; identity < 120; identity++) {
    const decision = limiter.consume(`rotating-${identity}`);
    assert.equal(decision.allowed, true, `identity ${identity} should pass while budget lasts`);
  }

  const overBudget = limiter.consume("rotating-120");
  assert.equal(overBudget.allowed, false, "a fresh identity must not escape the global ceiling");
  assert.equal(overBudget.scope, "global");
  assert.ok(overBudget.retryAfter > 0);
});

test("a refused first submission does not create a bucket", () => {
  let now = 1_700_000_000_000;
  const limiter = createLeadRateLimiter({
    globalLimit: 1,
    globalWindowMs: 10 * 60 * 1000,
    perClientLimit: 5,
    perClientWindowMs: 10 * 60 * 1000,
    clock: () => now,
  });

  assert.equal(limiter.consume("first").allowed, true);
  assert.equal(limiter.consume("second").allowed, false);
  assert.equal(limiter.size(), 1, "only the allowed identity should own a bucket");

  now += 10 * 60 * 1000;
  assert.equal(limiter.consume("second").allowed, true, "the same visitor succeeds once budget refills");
});

test("tokens refill after the window", () => {
  const { limiter, tick } = limiterAt(1_700_000_000_000);

  for (let attempt = 0; attempt < 5; attempt++) {
    limiter.consume("client-b");
  }
  assert.equal(limiter.consume("client-b").allowed, false);

  tick(10 * 60 * 1000);

  assert.equal(limiter.consume("client-b").allowed, true);
});

test("the key map stays bounded and is swept", () => {
  const { limiter } = limiterAt(1_700_000_000_000);

  for (let index = 0; index < 5000; index++) {
    limiter.consume(`key-${index}`);
  }

  assert.ok(limiter.size() <= 100, `size=${limiter.size()} must respect maxKeys`);
  assert.ok(limiter.sweep() >= 0);
  assert.ok(limiter.size() <= 100);
});
