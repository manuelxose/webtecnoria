"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexBlogPost = void 0;
const https_1 = require("firebase-functions/v2/https");
require("dotenv/config");
const googleapis_1 = require("googleapis");
exports.indexBlogPost = (0, https_1.onCall)({ region: process.env.REGION || "europe-west1" }, async (request) => {
    const url = request.data?.url;
    if (!url || !/^https?:\/\/.+/i.test(url)) {
        throw new https_1.HttpsError("invalid-argument", "URL inválida.");
    }
    const client_email = process.env.GOOGLE_CLIENT_EMAIL;
    const private_key = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
    const scopes = (process.env.INDEXING_SCOPES || "https://www.googleapis.com/auth/indexing").split(",");
    if (!client_email || !private_key) {
        throw new https_1.HttpsError("failed-precondition", "Faltan GOOGLE_CLIENT_EMAIL o GOOGLE_PRIVATE_KEY en .env");
    }
    const jwt = new googleapis_1.google.auth.JWT({ email: client_email, key: private_key, scopes });
    const indexing = googleapis_1.google.indexing({ version: "v3", auth: jwt });
    try {
        const res = await indexing.urlNotifications.publish({ requestBody: { url, type: "URL_UPDATED" } });
        return res.data;
    }
    catch (e) {
        throw new https_1.HttpsError("internal", "Indexing API error");
    }
});
