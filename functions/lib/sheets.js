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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendCompaniesToSheet = exports.createCompanyWorkbook = void 0;
const https_1 = require("firebase-functions/v2/https");
require("dotenv/config");
const googleapis_1 = require("googleapis");
const exceljs_1 = __importDefault(require("exceljs"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
function jwt(scopes) {
    const email = process.env.GOOGLE_CLIENT_EMAIL;
    const key = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
    if (!email || !key)
        throw new https_1.HttpsError("failed-precondition", "Faltan GOOGLE_CLIENT_EMAIL/GOOGLE_PRIVATE_KEY");
    return new googleapis_1.google.auth.JWT({ email, key, scopes });
}
function drive() {
    return googleapis_1.google.drive({ version: "v3", auth: jwt(["https://www.googleapis.com/auth/drive"]) });
}
function sheets() {
    const scopes = (process.env.SHEETS_SCOPES || "https://www.googleapis.com/auth/spreadsheets").split(",");
    return googleapis_1.google.sheets({ version: "v4", auth: jwt(scopes) });
}
async function ensureFolder(driveApi, name) {
    const r = await driveApi.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and trashed=false and name='${name}'`,
        fields: "files(id)",
        pageSize: 1,
    });
    if (r.data.files?.[0]?.id)
        return r.data.files[0].id;
    const created = await driveApi.files.create({
        requestBody: { name, mimeType: "application/vnd.google-apps.folder" },
        fields: "id",
    });
    return created.data.id;
}
exports.createCompanyWorkbook = (0, https_1.onCall)({ region: process.env.REGION || "europe-west1" }, async (request) => {
    const nombreArchivo = request.data?.nombreArchivo;
    const empresas = request.data?.empresas;
    if (!nombreArchivo || !Array.isArray(empresas)) {
        throw new https_1.HttpsError("invalid-argument", "nombreArchivo y empresas[] son obligatorios");
    }
    const tmp = path.join("/tmp", `${nombreArchivo}.xlsx`);
    const wb = new exceljs_1.default.Workbook();
    const ws = wb.addWorksheet(nombreArchivo);
    ws.columns = [
        { header: "Nombre de la empresa", key: "companyName" },
        { header: "Correo", key: "correos" },
        { header: "Teléfono", key: "phone" },
        { header: "Sitio web", key: "website" },
        { header: "Sitio web falla", key: "paginaErronea" },
        { header: "Dirección", key: "direccion" },
        { header: "Número de comentarios", key: "reviewCount" },
        { header: "Cerrado", key: "cerrado" },
    ];
    for (const e of empresas) {
        ws.addRow({
            companyName: e?.companyName ?? "",
            correos: e?.correos ?? "",
            phone: (e?.phone ?? "").toString().trim().replace(/^·/, ""),
            website: (e?.website ?? "").toString().trim().replace(/\n$/, ""),
            paginaErronea: e?.paginaErronea ?? "",
            direccion: e?.direccion ?? "",
            reviewCount: e?.reviewCount ?? "",
            cerrado: e?.cerrado ?? "",
        });
    }
    await wb.xlsx.writeFile(tmp);
    const d = drive();
    const folderId = await ensureFolder(d, request.data?.folderName || "correos_masivos");
    const media = {
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        body: fs.createReadStream(tmp),
    };
    const file = await d.files.create({
        requestBody: { name: nombreArchivo, mimeType: "application/vnd.google-apps.spreadsheet", parents: [folderId] },
        media, fields: "id"
    });
    try {
        fs.unlinkSync(tmp);
    }
    catch { }
    return { ok: true, fileId: file.data.id, folderId };
});
exports.appendCompaniesToSheet = (0, https_1.onCall)({ region: process.env.REGION || "europe-west1" }, async (request) => {
    const empresas = request.data?.empresas;
    const spreadsheetId = request.data?.sheetId || process.env.DEFAULT_SHEET_ID;
    const sheetName = request.data?.sheetName || "Hoja1";
    if (!spreadsheetId || !Array.isArray(empresas)) {
        throw new https_1.HttpsError("invalid-argument", "sheetId y empresas[] son obligatorios");
    }
    const values = empresas.map((e) => [
        e?.companyName ?? "",
        e?.correos ?? "",
        (e?.phone ?? "").toString().trim().replace(/^·/, ""),
        (e?.website ?? "").toString().trim().replace(/\n$/, ""),
        e?.paginaErronea ?? "",
        e?.direccion ?? "",
        e?.reviewCount ?? "",
        e?.cerrado ?? "",
    ]);
    const sh = sheets();
    await sh.spreadsheets.values.update({
        spreadsheetId, range: `${sheetName}!A1:H1`, valueInputOption: "USER_ENTERED",
        requestBody: { values: [[
                    "Nombre de la empresa", "Correo", "Teléfono", "Sitio web", "Sitio web falla", "Dirección", "Número de comentarios", "Cerrado"
                ]] }
    });
    await sh.spreadsheets.values.append({
        spreadsheetId, range: `${sheetName}!A2`, valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS", requestBody: { values }
    });
    return { ok: true, appended: values.length };
});
