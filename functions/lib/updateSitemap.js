"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSitemap = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = __importStar(require("firebase-admin"));
exports.updateSitemap = (0, firestore_1.onDocumentCreated)({
    document: "sitemap/{sitemapId}",
    region: process.env.REGION || "europe-west1",
}, async () => {
    const pagina = process.env.SITE_ORIGIN || "https://example.com";
    const date = new Date().toISOString();
    const routes = [];
    const snap = await admin.firestore().collection("sitemap").get();
    snap.forEach((d) => {
        const u = d.data()?.url;
        if (u)
            routes.push(u);
    });
    const items = routes
        .map((route) => {
        const loc = route === "/" ? pagina : `${pagina}${route}`;
        const freq = route.includes("blog/")
            ? "weekly"
            : route.includes("faq/")
                ? "weekly"
                : "daily";
        const priority = route === "/"
            ? "1.0"
            : route.includes("blog/")
                ? "0.64"
                : route.includes("faq/")
                    ? "0.3"
                    : "0.8";
        return `<url><loc>${loc}</loc><lastmod>${date}</lastmod><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`;
    })
        .join("");
    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</urlset>`;
    const bucket = admin.storage().bucket();
    await bucket
        .file("sitemap.xml")
        .save(xml, {
        metadata: {
            contentType: "application/xml",
            cacheControl: "public, max-age=31536000",
        },
        gzip: true,
    });
});
