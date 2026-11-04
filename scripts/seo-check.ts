import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { PUBLIC_PATHS } from "../apps/web/src/app/site/seo-route-manifest";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const port = 4417;
const apiPort = 4418;
const base = `http://127.0.0.1:${port}`;
const apiBase = `http://127.0.0.1:${apiPort}`;

function read(html: string, pattern: RegExp): string | null {
  return html.match(pattern)?.[1]?.trim() ?? null;
}

function canonical(html: string): string | null {
  return read(html, /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i);
}

function jsonLd(html: string): unknown {
  const body = read(
    html,
    /<script[^>]+id="tecnoria-jsonld"[^>]*>([\s\S]*?)<\/script>/i
  );
  assert.ok(body, "missing tecnoria-jsonld script");
  return JSON.parse(body);
}

async function waitForServer(): Promise<void> {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${base}/health`);
      if (response.ok) {
        return;
      }
    } catch {
      // server still starting
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("SSR server did not start");
}

async function request(path: string, redirect: RequestRedirect = "follow") {
  return fetch(`${base}${path}`, { redirect });
}

async function main(): Promise<void> {
  const api = createServer((request, response) => {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ code: "NOT_FOUND" }));
  });
  await new Promise<void>((resolve) => api.listen(apiPort, "127.0.0.1", resolve));

  const server = spawn(
    process.execPath,
    [join(root, "apps/web/dist/server/server.mjs")],
    {
      cwd: root,
      env: {
        ...process.env,
        PORT: String(port),
        API_INTERNAL_URL: apiBase,
      },
      stdio: ["ignore", "pipe", "pipe"],
    }
  );

  const serverErrors: string[] = [];
  server.stderr.on("data", (chunk) => serverErrors.push(String(chunk)));

  try {
    await waitForServer();

    const home = await request("/");
    assert.equal(home.status, 200);
    assert.equal(home.headers.get("x-powered-by"), null);
    const homeHtml = await home.text();
    assert.equal(canonical(homeHtml), "https://tecnoriasl.com/");
    assert.match(
      homeHtml,
      /<meta[^>]+name="robots"[^>]+content="index, follow"/i
    );
    assert.match(homeHtml, /<meta[^>]+property="og:title"[^>]+content="[^"]+"/i);
    assert.match(homeHtml, /<meta[^>]+property="og:url"[^>]+content="https:\/\/tecnoriasl\.com\/"/i);
    assert.match(homeHtml, /<meta[^>]+name="twitter:card"/i);
    assert.equal((homeHtml.match(/<h1[\s>]/gi) ?? []).length, 1);
    const homeSchema = jsonLd(homeHtml) as { "@graph": unknown[] };
    assert.ok(Array.isArray(homeSchema["@graph"]));
    assert.ok(homeSchema["@graph"].length >= 3);

    for (const path of PUBLIC_PATHS) {
      const page = await request(path);
      assert.equal(page.status, 200, `${path} returned ${page.status}`);
      const html = await page.text();
      const expected =
        path === "/" ? "https://tecnoriasl.com/" : `https://tecnoriasl.com${path}`;
      assert.equal(canonical(html), expected, `${path} canonical mismatch`);
      assert.match(
        html,
        /<meta[^>]+name="robots"[^>]+content="index, follow"/i,
        `${path} is not indexable`
      );
      assert.equal(
        (html.match(/<h1[\s>]/gi) ?? []).length,
        1,
        `${path} must have exactly one H1`
      );
      jsonLd(html);
    }

    const service = await request("/servicios/desarrollo-software-medida");
    assert.equal(service.status, 200);
    const serviceHtml = await service.text();
    assert.equal(
      canonical(serviceHtml),
      "https://tecnoriasl.com/servicios/desarrollo-software-medida"
    );
    const serviceSchema = jsonLd(serviceHtml) as {
      "@graph": Array<{ "@type": string }>;
    };
    assert.ok(serviceSchema["@graph"].some((item) => item["@type"] === "Service"));

    const article = await request("/blog/cuanto-cuesta-desarrollar-software-medida");
    assert.equal(article.status, 200);
    const articleHtml = await article.text();
    assert.equal(
      canonical(articleHtml),
      "https://tecnoriasl.com/blog/cuanto-cuesta-desarrollar-software-medida"
    );
    const articleSchema = jsonLd(articleHtml) as {
      "@graph": Array<{ "@type": string }>;
    };
    assert.ok(articleSchema["@graph"].some((item) => item["@type"] === "Article"));

    const notFound = await request("/this-page-does-not-exist-test-123");
    assert.equal(notFound.status, 404);
    assert.match(notFound.headers.get("x-robots-tag") ?? "", /noindex/i);
    assert.equal(canonical(await notFound.text()), null);

    const blogNotFound = await request("/blog/not-a-real-article");
    assert.equal(blogNotFound.status, 404);

    const legacy = await request("/nosotros", "manual");
    assert.equal(legacy.status, 301);
    assert.equal(legacy.headers.get("location"), "/empresa");

    const authLegacy = await request("/auth-cover-login", "manual");
    assert.equal(authLegacy.status, 301);
    assert.equal(authLegacy.headers.get("location"), "/auth-login");

    const fakeAuth = await request("/auth-foo");
    assert.equal(fakeAuth.status, 404);

    const trailing = await request("/servicios/", "manual");
    assert.equal(trailing.status, 301);
    assert.equal(trailing.headers.get("location"), "/servicios");

    const uppercase = await request("/SERVICIOS", "manual");
    assert.equal(uppercase.status, 301);
    assert.equal(uppercase.headers.get("location"), "/servicios");

    const privateRoute = await request("/dashboard", "manual");
    assert.equal(privateRoute.status, 302);
    assert.match(privateRoute.headers.get("location") ?? "", /\/auth-login/);

    const missingAsset = await request("/assets/does-not-exist.js");
    assert.equal(missingAsset.status, 404);
    assert.match(missingAsset.headers.get("content-type") ?? "", /text\/plain/);

    const assetPath = read(homeHtml, /src="([^"]*main-[^"]+\.js)"/);
    if (!assetPath) {
      throw new Error("could not find a hashed JS asset in the homepage");
    }
    const asset = await request(assetPath.startsWith("/") ? assetPath : `/${assetPath}`);
    assert.equal(asset.status, 200);
    const cacheControl = asset.headers.get("cache-control") ?? "";
    assert.match(cacheControl, /immutable/);
    assert.doesNotMatch(cacheControl, /no-store/);

    const robots = await request("/robots.txt");
    assert.equal(robots.status, 200);
    const robotsBody = await robots.text();
    assert.match(robotsBody, /Sitemap: https:\/\/tecnoriasl\.com\/sitemap\.xml/);
    assert.match(robotsBody, /Disallow: \/portal/);

    const sitemap = await request("/sitemap.xml");
    assert.equal(sitemap.status, 200);
    const sitemapBody = await sitemap.text();
    const locs = new Set(
      [...sitemapBody.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
    );
    for (const path of PUBLIC_PATHS) {
      const url = path === "/" ? "https://tecnoriasl.com/" : `https://tecnoriasl.com${path}`;
      assert.ok(locs.has(url), `sitemap is missing ${url}`);
    }

    const sourceSitemap = readFileSync(
      join(root, "apps/web/src/sitemap.xml"),
      "utf8"
    );
    assert.match(sourceSitemap, /productos\/talkaris/);
    assert.match(sourceSitemap, /productos\/auctorio/);

    console.log(
      `SEO checks passed: ${PUBLIC_PATHS.size} public routes, JSON-LD, 404/301, cache and sitemap.`
    );
  } finally {
    server.kill();
    api.close();
    if (serverErrors.length) {
      process.stderr.write(serverErrors.join(""));
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
