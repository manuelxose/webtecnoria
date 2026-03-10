import { onCall, HttpsError } from "firebase-functions/v2/https";
import "dotenv/config";
import { google } from "googleapis";

export const indexBlogPost = onCall(
  { region: process.env.REGION || "europe-west1" },
  async (request) => {
    const url = request.data?.url as string;
    if (!url || !/^https?:\/\/.+/i.test(url)) {
      throw new HttpsError("invalid-argument", "URL inválida.");
    }

    const client_email = process.env.GOOGLE_CLIENT_EMAIL;
    const private_key = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
    const scopes = (process.env.INDEXING_SCOPES || "https://www.googleapis.com/auth/indexing").split(",");

    if (!client_email || !private_key) {
      throw new HttpsError("failed-precondition", "Faltan GOOGLE_CLIENT_EMAIL o GOOGLE_PRIVATE_KEY en .env");
    }

    const jwt = new google.auth.JWT({ email: client_email, key: private_key, scopes });
    const indexing = google.indexing({ version: "v3", auth: jwt as any });

    try {
      const res = await indexing.urlNotifications.publish({ requestBody: { url, type: "URL_UPDATED" } });
      return res.data;
    } catch (e) {
      throw new HttpsError("internal", "Indexing API error");
    }
  }
);
