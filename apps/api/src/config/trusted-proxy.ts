import { createHash, createHmac } from "node:crypto";
import type { Request } from "express";

/**
 * Cloudflare CIDR snapshot.
 *
 * Fetched 2026-11-05 from https://www.cloudflare.com/ips-v4 and
 * https://www.cloudflare.com/ips-v6. Regenerate with:
 *   node scripts/refresh-cloudflare-ranges.mjs
 *
 * Do not hand-edit: the refresh script rewrites everything between the
 * BEGIN/END markers below.
 */
// BEGIN CLOUDFLARE RANGES (generated)
export const CLOUDFLARE_IPV4: readonly string[] = [
  "173.245.48.0/20",
  "103.21.244.0/22",
  "103.22.200.0/22",
  "103.31.4.0/22",
  "141.101.64.0/18",
  "108.162.192.0/18",
  "190.93.240.0/20",
  "188.114.96.0/20",
  "197.234.240.0/22",
  "198.41.128.0/17",
  "162.158.0.0/15",
  "104.16.0.0/13",
  "104.24.0.0/14",
  "172.64.0.0/13",
  "131.0.72.0/22",
];

export const CLOUDFLARE_IPV6: readonly string[] = [
  "2400:cb00::/32",
  "2606:4700::/32",
  "2803:f800::/32",
  "2405:b500::/32",
  "2405:8100::/32",
  "2a06:98c0::/29",
  "2c0f:f248::/32",
];
// END CLOUDFLARE RANGES (generated)

type Family = 4 | 6;

interface ParsedIp {
  family: Family;
  value: bigint;
}

interface ParsedCidr extends ParsedIp {
  prefix: number;
}

const IPV4_PATTERN = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const IPV6_PATTERN = /^[0-9a-f:.]+$/i;

/** Parses an IPv4 or IPv6 literal. Returns null for anything else. */
export function parseIp(input: unknown): ParsedIp | null {
  if (typeof input !== "string") {
    return null;
  }

  const value = input.trim();
  if (value.length === 0 || value.length > 64) {
    return null;
  }

  const v4 = IPV4_PATTERN.exec(value);
  if (v4) {
    const octets = [v4[1], v4[2], v4[3], v4[4]].map((part) => Number(part));
    if (octets.some((octet) => octet > 255)) {
      return null;
    }
    const [a, b, c, d] = octets;
    return { family: 4, value: (BigInt(a) << 24n) | (BigInt(b) << 16n) | (BigInt(c) << 8n) | BigInt(d) };
  }

  if (!IPV6_PATTERN.test(value)) {
    return null;
  }

  const zoneSplit = value.split("%");
  if (zoneSplit.length > 1) {
    return null;
  }

  const halves = value.split("::");
  if (halves.length > 2) {
    return null;
  }

  const expand = (part: string): string[] => (part.length === 0 ? [] : part.split(":"));
  const head = expand(halves[0] ?? "");
  const tail = halves.length === 2 ? expand(halves[1]) : [];
  const missing = 8 - (head.length + tail.length);

  if (missing < 0 || (halves.length === 1 && missing !== 0)) {
    return null;
  }

  const groups = [...head, ...Array.from({ length: missing }, () => "0"), ...tail];
  if (groups.length !== 8) {
    return null;
  }

  let acc = 0n;
  for (const group of groups) {
    if (!/^[0-9a-f]{1,4}$/i.test(group)) {
      return null;
    }
    acc = (acc << 16n) | BigInt(parseInt(group, 16));
  }

  return { family: 6, value: acc };
}

function parseCidr(cidr: string): ParsedCidr | null {
  const [address, prefixRaw] = cidr.split("/");
  const parsed = parseIp(address);
  if (!parsed) {
    return null;
  }

  const maxPrefix = parsed.family === 4 ? 32 : 128;
  const prefix = prefixRaw === undefined ? maxPrefix : Number(prefixRaw);
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > maxPrefix) {
    return null;
  }

  return { ...parsed, prefix };
}

const CLOUDFLARE_CIDRS: readonly ParsedCidr[] = [
  ...CLOUDFLARE_IPV4,
  ...CLOUDFLARE_IPV6,
].map(parseCidr).filter((entry): entry is ParsedCidr => entry !== null);

function contains(cidr: ParsedCidr, ip: ParsedIp): boolean {
  if (cidr.family !== ip.family) {
    return false;
  }

  const bits = cidr.family === 4 ? 32n : 128n;
  const shift = bits - BigInt(cidr.prefix);
  const mask = shift === bits ? 0n : ((1n << bits) - 1n) ^ ((1n << shift) - 1n);

  return (cidr.value & mask) === (ip.value & mask);
}

/** True when the address belongs to the embedded Cloudflare range snapshot. */
export function isCloudflareIp(address: unknown): boolean {
  const parsed = parseIp(address);
  if (!parsed) {
    return false;
  }

  return CLOUDFLARE_CIDRS.some((cidr) => contains(cidr, parsed));
}

/**
 * Returns a single validated address from a header value, or null when the
 * header is absent, unparseable or carries more than one address.
 * Multi-value headers are rejected on purpose: a chain we cannot attribute is
 * not a client identity.
 */
export function parseSingleIp(value: unknown): string | null {
  const raw = Array.isArray(value) ? value.join(",") : value;
  if (typeof raw !== "string") {
    return null;
  }

  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.includes(",")) {
    return null;
  }

  return parseIp(trimmed) ? trimmed : null;
}

export type ClientIpSource = "cloudflare" | "direct" | "cloudflare-invalid-header";

export interface ResolvedClientIp {
  ip: string;
  source: ClientIpSource;
}

/**
 * Resolves the visitor address for a request that arrives through
 * client -> Cloudflare -> nginx (loopback) -> node.
 *
 * With `trust proxy` set to "loopback", `req.ip` is the address that connected
 * to nginx. When that peer is a Cloudflare edge we trust `CF-Connecting-IP`
 * (only then, because only then can the value have come from Cloudflare);
 * otherwise the peer address itself is the client and any header is ignored.
 */
export function resolveClientIp(req: Pick<Request, "ip" | "headers">): ResolvedClientIp {
  const peer = parseIp(req.ip) ? String(req.ip).trim() : "";
  if (peer.length === 0) {
    return { ip: "unknown", source: "direct" };
  }

  if (!isCloudflareIp(peer)) {
    return { ip: peer, source: "direct" };
  }

  const forwarded = parseSingleIp(req.headers["cf-connecting-ip"]);
  if (!forwarded) {
    return { ip: peer, source: "cloudflare-invalid-header" };
  }

  return { ip: forwarded, source: "cloudflare" };
}

function clientHashKey(): Buffer {
  const secret = process.env["JWT_SECRET"];
  if (!secret) {
    throw new Error("JWT_SECRET is required to hash client identifiers");
  }

  return createHash("sha256").update(`tecnoria:client-id:v1:${secret}`).digest();
}

const hashCache = new Map<string, string>();
const HASH_CACHE_LIMIT = 2048;

/**
 * Stable, non-reversible client identifier: HMAC-SHA256 truncated to 16 hex
 * characters. The raw address is never stored or logged.
 */
export function hashClientId(ip: string): string {
  const cached = hashCache.get(ip);
  if (cached) {
    return cached;
  }

  const digest = createHmac("sha256", clientHashKey()).update(ip).digest("hex").slice(0, 16);
  if (hashCache.size >= HASH_CACHE_LIMIT) {
    hashCache.clear();
  }
  hashCache.set(ip, digest);

  return digest;
}

/** Convenience wrapper: resolve then hash, in one step. */
export function clientHashForRequest(req: Pick<Request, "ip" | "headers">): string {
  return hashClientId(resolveClientIp(req).ip);
}
