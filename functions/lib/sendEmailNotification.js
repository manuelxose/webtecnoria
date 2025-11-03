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
exports.sendEmailNotification = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
require("dotenv/config");
const nodemailer = __importStar(require("nodemailer"));
const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, REGION } = process.env;
const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: String(SMTP_SECURE || "false") === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
});
exports.sendEmailNotification = (0, firestore_1.onDocumentCreated)({ document: "contacto/{id}", region: REGION || "europe-west1" }, async (event) => {
    const snap = event.data;
    if (!snap)
        return;
    const contact = snap.data();
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
});
