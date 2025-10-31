/* eslint-disable linebreak-style */
/* eslint-disable padded-blocks */
/* eslint-disable prefer-const */
/* eslint-disable linebreak-style */
/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
/* eslint-disable linebreak-style */
/* eslint-disable eol-last */
/* eslint-disable linebreak-style */
/* eslint-disable comma-dangle */
/* eslint-disable linebreak-style */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
/* eslint-disable linebreak-style */
import fs from "fs/promises";
import {google as google} from "googleapis";
import path from "path";
import {authenticate as authenticate} from "@google-cloud/local-auth";
import excel from "exceljs";
import fs2 from "fs";
// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/spreadsheets"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.normalize(__dirname + "/../credentials/token.json");
const CREDENTIALS_PATH = path.normalize(__dirname + "/../credentials/credentials.json");
let empresaFile ="";
console.log("TOKEN_PATH", TOKEN_PATH);
console.log("CREDENTIALS_PATH", CREDENTIALS_PATH);

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    console.log("Loading saved credentials", TOKEN_PATH);
    const content:any = await fs.readFile(TOKEN_PATH);
    const credentials:any = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content:any = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client:any = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
async function main(auth) {
  const drive:any = google.drive({version: "v3", auth});

  const folderName:any = "correos_masivos";
  let empresas = await leerEmpresas();

  empresas = JSON.parse(empresas);

  createCSV(empresas);


  // Create a new spreadsheet in the folder


  drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and trashed=false and name='${folderName}'`,
    fields: "files(id)",
  }, (err, res) => {
    if (err) {
      console.error(err);
      return;
    }

    if (res?.data.files?.length) {
      // La carpeta existe, crea la hoja de cálculo en ella´
      // pasar el id de la carpeta a la funcion createSpreadsheet
      createSpreadsheet(drive, res.data.files[0].id);
    } else {
      // La carpeta no existe, créala y luego crea la hoja de cálculo en ella
      drive.files.create({
        resource: {
          name: folderName,
          mimeType: "application/vnd.google-apps.folder"
        },
      }, (err, folder) => {
        if (err) {
          console.error(err);
          return;
        }
        createSpreadsheet(drive, folder.data.id);
      });
    }
  });
}


// mueve la hoja de cálculo a la carpeta especificada
function moveSpreadsheet(spreadsheetId, folder, drive) {
  drive.files.update({
    fileId: spreadsheetId,
    addParents: folder,
    fields: "id, parents",
  }, (err, file) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`Se ha movido la hoja de cálculo con ID: ${file.data.id}`);
  });
}

// Crea una nueva hoja de Google Sheets en la carpeta especificada
function createSpreadsheet(drive, folderId) {

  const media = {
    mimeType: "application/vnd.ms-excel",
    body: fs2.createReadStream(__dirname+"/../files/"+empresaFile+".xlsx")
  };

  const fileMetadata = {
    name: empresaFile,
    mimeType: "application/vnd.google-apps.spreadsheet"
  };


  drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: "id"
  }, (err, file) => {
    if (err) {
      // Manejar el error
      console.error(err);
    } else {
      console.log(`Archivo creado con ID: ${file.data.id}`);
      moveSpreadsheet(file.data.id, folderId, drive);
    }
  });


}


function crearHojadeCalculo() {
  authorize().then(main).catch(console.error);
}

async function leerEmpresas() {
  // eslint-disable-next-line no-trailing-spaces
  
  let empresas:any;
  // /asignar el archivo empresas a una variable
  empresas = await fs.readFile(path.normalize(__dirname + "/../files/"+ empresaFile + ".json"), "utf8").catch((err) => {
    console.log("No lee este archivo" + err);
  });

  return empresas;
}

function createCSV(empresas) {
  // Crear un nuevo libro de trabajo de Excel
  const workbook = new excel.Workbook();

  // Crear una nueva hoja de cálculo en el libro de trabajo
  const worksheet = workbook.addWorksheet(empresaFile);

  // Definir la cabecera
  worksheet.columns = [

    {header: "Nombre de la empresa", key: "companyName"},
    {header: "Correo", key: "correos"},
    {header: "Teléfono", key: "phone"},
    {header: "Sitio web", key: "website"},
    {header: "Sitio web falla", key: "paginaErronea"},
    {header: "Dirección", key: "direccion"},
    {header: "Número de comentarios", key: "reviewCount"},
    {header: "Cerrado", key: "cerrado"},

  ];

  // Agregar datos al libro de trabajo
  empresas.forEach((empresa) => {
    let data:any;
    if (empresa === null) {
    // Realizar una acción si empresa es nula
      data = empresa ?? {companyName: "", reviewCount: "", phone: "", website: "", direccion: "", correos: "", paginaErronea: "", cerrado: ""};
    } else {
      data = {
        companyName: empresa.companyName === null ? "" : empresa.companyName,
        reviewCount: empresa.reviewCount === null ? "" : empresa.reviewCount,
        phone: empresa.phone === null ? "" : empresa.phone = empresa.phone.trim().replace(/^·/, ""),
        website: empresa.website === null ? "" : empresa.website.trim().replace(/\n$/, ""),
        direccion: empresa.direccion === null ? "" : empresa.direccion,
        correos: empresa.correos === null ? "" : empresa.correos,
        paginaErronea: empresa.paginaErronea === null ? "" : empresa.paginaErronea,
        cerrado: empresa.cerrado === null ? "" : empresa.cerrado,
      };
      worksheet.addRow(data);
    }
  });

  // Guardar el libro de trabajo en un archivo
  workbook.xlsx.writeFile(__dirname+"/../files/"+empresaFile+".xlsx")
    .then(() => {
      console.log("El archivo "+empresaFile+".xlsx ha sido creado con éxito");
    })
    .catch((error) => {
      console.log("Ha ocurrido un error al crear el archivo", error);
    });
}

// exportar crearHojadeCalculo para poder usarla en el archivo index.js provide default export for compatibility
// poroporcional export named default

export default async function writeExcel(nombreArchivo): Promise<void> {
  empresaFile = nombreArchivo;

  // ejecutar las funciones en paralelo
  await Promise.all([
    crearHojadeCalculo(),
    // agregar más funciones aquí
  ]);
}

