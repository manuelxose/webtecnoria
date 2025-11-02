import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

export const updateSitemap = onDocumentCreated(
  { document: "sitemap/{sitemapId}", region: process.env.REGION || "europe-west1" },
  async () => {
    const pagina = process.env.SITE_ORIGIN || "https://example.com";
    const date = new Date().toISOString();
    const routes: string[] = [];
    const snap = await admin.firestore().collection("sitemap").get();
    snap.forEach((d) => { const u = (d.data() as any)?.url; if (u) routes.push(u); });

    const items = routes.map((route) => {
      const loc = route === "/" ? pagina : `${pagina}${route}`;
      const freq = route.includes("blog/") ? "weekly" : route.includes("faq/") ? "weekly" : "daily";
      const priority = route === "/" ? "1.0" : route.includes("blog/") ? "0.64" : route.includes("faq/") ? "0.3" : "0.8";
      return `<url><loc>${loc}</loc><lastmod>${date}</lastmod><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`;
    }).join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</urlset>`;
    const bucket = admin.storage().bucket();
    await bucket.file("sitemap.xml").save(xml, { metadata: { contentType: "application/xml", cacheControl: "public, max-age=31536000" }, gzip: True as any } as any);
  }
);
