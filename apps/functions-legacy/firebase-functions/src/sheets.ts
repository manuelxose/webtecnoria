import { onCall, HttpsError } from "firebase-functions/v2/https";
import "dotenv/config";
import { google } from "googleapis";
import ExcelJS from "exceljs";
import * as path from "path";
import * as fs from "fs";
import * as admin from "firebase-admin";

type Empresa = {
  companyName?: string | null;
  correos?: string | null;
  phone?: string | null;
  website?: string | null;
  paginaErronea?: string | null;
  direccion?: string | null;
  reviewCount?: string | number | null;
  cerrado?: string | boolean | null;
};

function jwt(scopes: string[]) {
  const email = process.env.GOOGLE_CLIENT_EMAIL;
  const key = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  if (!email || !key) throw new HttpsError("failed-precondition", "Faltan GOOGLE_CLIENT_EMAIL/GOOGLE_PRIVATE_KEY");
  return new google.auth.JWT({ email, key, scopes });
}

function drive() {
  return google.drive({ version: "v3", auth: jwt(["https://www.googleapis.com/auth/drive"]) as any });
}
function sheets() {
  const scopes = (process.env.SHEETS_SCOPES || "https://www.googleapis.com/auth/spreadsheets").split(",");
  return google.sheets({ version: "v4", auth: jwt(scopes) as any });
}

async function ensureFolder(driveApi: any, name: string) {
  const r = await driveApi.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and trashed=false and name='${name}'`,
    fields: "files(id)",
    pageSize: 1,
  });
  if (r.data.files?.[0]?.id) return r.data.files[0].id;
  const created = await driveApi.files.create({
    requestBody: { name, mimeType: "application/vnd.google-apps.folder" },
    fields: "id",
  });
  return created.data.id;
}

export const createCompanyWorkbook = onCall(
  { region: process.env.REGION || "europe-west1" },
  async (request) => {
    const nombreArchivo = request.data?.nombreArchivo as string;
    const empresas = request.data?.empresas as Empresa[];
    if (!nombreArchivo || !Array.isArray(empresas)) {
      throw new HttpsError("invalid-argument", "nombreArchivo y empresas[] son obligatorios");
    }

    const tmp = path.join("/tmp", `${nombreArchivo}.xlsx`);
    const wb = new ExcelJS.Workbook();
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
    try { fs.unlinkSync(tmp); } catch {}
    return { ok: true, fileId: file.data.id, folderId };
  }
);

export const appendCompaniesToSheet = onCall(
  { region: process.env.REGION || "europe-west1" },
  async (request) => {
    const empresas = request.data?.empresas as Empresa[];
    const spreadsheetId = request.data?.sheetId || process.env.DEFAULT_SHEET_ID;
    const sheetName = request.data?.sheetName || "Hoja1";
    if (!spreadsheetId || !Array.isArray(empresas)) {
      throw new HttpsError("invalid-argument", "sheetId y empresas[] son obligatorios");
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
        "Nombre de la empresa","Correo","Teléfono","Sitio web","Sitio web falla","Dirección","Número de comentarios","Cerrado"
      ]] }
    });
    await sh.spreadsheets.values.append({
      spreadsheetId, range: `${sheetName}!A2`, valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS", requestBody: { values }
    });
    return { ok: true, appended: values.length };
  }
);
