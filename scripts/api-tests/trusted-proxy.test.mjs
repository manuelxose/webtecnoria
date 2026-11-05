// resolveClientIp / hashClientId — the part that decides whose flood it is.
import assert from "node:assert/strict";
import test from "node:test";

import "./helpers.mjs";

const { isCloudflareIp, parseSingleIp, resolveClientIp, hashClientId } = await import(
  "../../apps/api/src/config/trusted-proxy.js"
);

test("embedded ranges cover the edge addresses measured in production", () => {
  for (const edge of [
    "172.71.148.71",
    "172.70.240.3",
    "104.22.123.46",
    "172.68.151.17",
    "162.158.0.1",
    "2606:4700::1",
    "2a06:98c1::1", // inside 2a06:98c0::/29
  ]) {
    assert.equal(isCloudflareIp(edge), true, `${edge} should be Cloudflare`);
  }

  for (const other of ["198.51.100.7", "8.8.8.8", "109.123.248.164", "2001:db8::1", "not-an-ip", ""]) {
    assert.equal(isCloudflareIp(other), false, `${other} should not be Cloudflare`);
  }
});

test("a Cloudflare peer gets the CF-Connecting-IP address", () => {
  const resolved = resolveClientIp({
    ip: "172.71.148.71",
    headers: { "cf-connecting-ip": "203.0.113.9" },
  });

  assert.deepEqual(resolved, { ip: "203.0.113.9", source: "cloudflare" });
});

test("a Cloudflare peer over IPv6 also gets the forwarded address", () => {
  const resolved = resolveClientIp({
    ip: "2606:4700::1",
    headers: { "cf-connecting-ip": "198.51.100.44" },
  });

  assert.deepEqual(resolved, { ip: "198.51.100.44", source: "cloudflare" });
});

test("a non-Cloudflare peer never gets to name the client (header ignored)", () => {
  const resolved = resolveClientIp({
    ip: "198.51.100.7",
    headers: { "cf-connecting-ip": "203.0.113.9" },
  });

  assert.deepEqual(resolved, { ip: "198.51.100.7", source: "direct" });
});

test("a malformed or multi-value CF-Connecting-IP falls back to the peer", () => {
  for (const header of ["not-an-ip", "203.0.113.9, 10.0.0.1", "", "   "]) {
    const resolved = resolveClientIp({
      ip: "172.71.148.71",
      headers: { "cf-connecting-ip": header },
    });

    assert.equal(resolved.ip, "172.71.148.71", `header ${JSON.stringify(header)} must not be trusted`);
    assert.equal(resolved.source, "cloudflare-invalid-header");
  }
});

test("parseSingleIp rejects arrays that carry more than one address", () => {
  assert.equal(parseSingleIp("203.0.113.9"), "203.0.113.9");
  assert.equal(parseSingleIp(["203.0.113.9", "10.0.0.1"]), null);
  assert.equal(parseSingleIp("203.0.113.9,10.0.0.1"), null);
  assert.equal(parseSingleIp(undefined), null);
});

test("hashClientId is stable, salted and never leaks the address", () => {
  const first = hashClientId("203.0.113.9");
  const second = hashClientId("203.0.113.9");
  const other = hashClientId("203.0.113.10");

  assert.match(first, /^[0-9a-f]{16}$/);
  assert.equal(first, second);
  assert.notEqual(first, other);
  assert.equal(first.includes("203.0.113.9"), false);
});
