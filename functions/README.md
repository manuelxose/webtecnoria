# Tecnoria Functions — .env driven, SSR-ready (Firebase Functions v2, Node 20)

## 1) Configure .env
Copy `.env.example` to `.env` and fill values. These are used at runtime (no Firebase Secrets required).

## 2) Copy SSR bundle
Build your Angular Universal server bundle and copy it next to functions:
```
# from repo root
ng build
ng run <project>:server
cd functions
SOURCE_MAIN=../dist/server/main.js SOURCE_INDEX_HTML=../dist/browser/index.html npm run build:ssr:copy
```
Then set `SSR_MAIN_PATH=angular-ssr/main.js` in `.env` (by default it's already that path).

## 3) Install and build
```
cd functions
npm i
npm run build
```

## 4) Deploy
```
firebase deploy --only functions
```

## Included functions
- `ssr` (HTTPS) — loads your server bundle from `SSR_MAIN_PATH`
- `sendEmailNotification` (Firestore trigger on `contacto/{id}`) — uses SMTP from `.env`
- `indexBlogPost` (callable) — Google Indexing using service account from `.env`
- `createCompanyWorkbook` (callable) — builds Excel in /tmp and uploads to Drive
- `appendCompaniesToSheet` (callable) — appends rows to a Google Sheet
- `companyScraper` (HTTPS) — Puppeteer serverless worker; writes JSON to Storage
- `updateSitemap` (Firestore trigger) — writes sitemap.xml to Storage

## Notes
- No Landrick-specific paths. Everything is controlled via `.env` and the copy script.
- No @google-cloud/local-auth; uses service-account from `.env` (EMAIL+PRIVATE KEY).
- Make sure the service account has permissions for Drive/Sheets/Indexing as needed.
