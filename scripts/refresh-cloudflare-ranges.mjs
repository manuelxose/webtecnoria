// Regenerates the Cloudflare CIDR snapshot embedded in
// apps/api/src/config/trusted-proxy.ts.
//
//   node scripts/refresh-cloudflare-ranges.mjs
//   node scripts/refresh-cloudflare-ranges.mjs --check   (exit 1 if stale)
//
// No dependencies: Node 24 global fetch + fs. Writes nothing on --check.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const TARGET = join(ROOT, "apps", "api", "src", "config", "trusted-proxy.ts");

const SOURCES = [
  { url: "https://www.cloudflare.com/ips-v4", constant: "CLOUDFLARE_IPV4", family: 4 },
  { url: "https://www.cloudflare.com/ips-v6", constant: "CLOUDFLARE_IPV6", family: 6 },
];

const BEGIN = "// BEGIN CLOUDFLARE RANGES (generated)";
const END = "// END CLOUDFLARE RANGES (generated)";

function isValidCidr(value, family) {
  const [address, prefix] = value.split("/");
  if (!/^\d+$/.test(prefix ?? "")) {
    return false;
  }
  const max = family === 4 ? 32 : 128;
  if (Number(prefix) > max) {
    return false;
  }
  return family === 4
    ? /^\d{1,3}(\.\d{1,3}){3}$/.test(address) && address.split(".").every((o) => Number(o) <= 255)
    : /^[0-9a-f:]+$/i.test(address) && address.includes(":");
}

async function fetchRanges(source) {
  const response = await fetch(source.url, { headers: { "user-agent": "tecnoria-cloudflare-range-refresh/1" } });
  if (!response.ok) {
    throw new Error(`${source.url} -> HTTP ${response.status}`);
  }

  const text = await response.text();
  const ranges = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (ranges.length === 0) {
    throw new Error(`${source.url} returned no ranges`);
  }

  const invalid = ranges.filter((range) => !isValidCidr(range, source.family));
  if (invalid.length > 0) {
    throw new Error(`${source.url} returned unparseable entries: ${invalid.join(", ")}`);
  }

  return ranges;
}

function render(sections) {
  const today = new Date().toISOString().slice(0, 10);
  const blocks = sections.map(({ constant, ranges }) => {
    const entries = ranges.map((range) => `  ${JSON.stringify(range)},`).join("\n");
    return `export const ${constant}: readonly string[] = [\n${entries}\n];`;
  });

  return [
    BEGIN,
    "",
    ...blocks.flatMap((block) => [block, ""]),
    END,
    "",
    `// Snapshot date: ${today}`,
  ].join("\n");
}

async function main() {
  const check = process.argv.includes("--check");
  const sections = [];

  for (const source of SOURCES) {
    sections.push({ constant: source.constant, ranges: await fetchRanges(source) });
  }

  const current = readFileSync(TARGET, "utf8");
  const start = current.indexOf(BEGIN);
  const end = current.indexOf(END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`markers not found in ${TARGET}`);
  }

  const updated =
    current.slice(0, start) +
    render(sections) +
    current.slice(end + END.length);

  if (updated === current) {
    console.log("cloudflare ranges: already up to date");
    return;
  }

  if (check) {
    console.error("cloudflare ranges: STALE (run without --check to update)");
    process.exitCode = 1;
    return;
  }

  writeFileSync(TARGET, updated, "utf8");
  const total = sections.reduce((sum, section) => sum + section.ranges.length, 0);
  console.log(`cloudflare ranges: updated ${total} entries in ${TARGET}`);
}

main().catch((error) => {
  console.error(`refresh failed: ${error.message}`);
  process.exitCode = 1;
});
