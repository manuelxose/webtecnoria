import { onDocumentCreated } from "firebase-functions/v2/firestore";
import "dotenv/config";
import * as nodemailer from "nodemailer";

const {
  SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, REGION
} = process.env as Record<string,string>;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 587),
  secure: String(SMTP_SECURE || "false") === "true",
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

export const sendEmailNotification = onDocumentCreated(
  { document: "contacto/{id}", region: REGION || "europe-west1" },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const contact = snap.data() as any;

    const lines = [
      `Nombre: ${contact.name || "N/A"}`,
      `Email: ${contact.email || "N/A"}`,
      `Teléfono: ${contact.phone || "N/A"}`,
      `Servicio: ${contact.service || "N/A"}`,
      `Mensaje: ${contact.message || "N/A"}`,
    ].join("\n");

    await transporter.sendMail({
      from: `"Web" <${SMTP_USER}>`,
      to: process.env.EMAIL_TO || SMTP_USER,
      subject: `Nuevo contacto - ${contact.name || "Sin nombre"}`,
      text: lines,
    });
  }
);
