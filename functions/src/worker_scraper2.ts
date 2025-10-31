/* eslint-disable linebreak-style */

/* eslint-disable no-constant-condition */
/* eslint-disable no-useless-escape */
/* eslint-disable no-trailing-spaces */
/* eslint-disable indent */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
/* eslint-disable eol-last */
/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable linebreak-style */
/* eslint-disable require-jsdoc */

import {workerData, parentPort} from "worker_threads";
import puppeteer from "puppeteer";
import Promise = require("bluebird");


async function scrapePage(url: any) {
  let webPage = "https://www.paginasamarillas.es/";
  console.log("URL: " + url);
  
  let empresa = url.split(",")[0];
  let lugar = url.split(",")[1];
  let objetoDatos:any = [];
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--disable-extensions",
      "--disable-infobars",
      "--disable-notifications",
      "--disable-web-security",
      "--disable-site-isolation-trials",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-translate",
      "--disable-device-discovery-notifications",
      "--disable-features=site-per-process",
      "--lang=es-ES",
      "--disable-geolocation",
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
      "--no-default-browser-check",
      "--no-first-run",
      "--disable-popup-blocking",
      "--disable-breakpad",
    ],
    defaultViewport: null,
  });  
  const [page] = await browser.pages();
  await page.setGeolocation({latitude: 40.416775, longitude: -3.703790, accuracy: 100});

  await page.goto(webPage, {waitUntil: "networkidle0"});

  await page.type("#whatInput", empresa);
  await page.type("#where", lugar);
  await page.click("#submitBtn");


  await page.waitForNavigation({waitUntil: "networkidle0"}).then(async () => {
    await parsePlaces(page).then(async (res) => {
        await browser.close();

        objetoDatos = await getEmailsParallel(res);
    });
  });


  return objetoDatos;
}

(async () => {
  const result = await scrapePage(workerData);
  parentPort?.postMessage(result);
})();


  // pasar el bucle para dentro de la lectura pagina y poder ajustar las variables
  async function parsePlaces(page: any) {
    let objetosDatos: any[] = [];
    let nextButton: any[] = [];
    
    try {
    nextButton = await page.$$("ul.pagination>li>a");
    console.log(`Número de botones: ${nextButton.length}`);
    for (let i = 1; i < nextButton.length - 1; i++) {
      console.log(`Botón: ${i}`);
      
      await page.waitForSelector("div.listado-item", {waitUntil: "networkidle0"});
      const elementos = await page.$$("div.listado-item");
    
      const resultados = await Promise.all(
        elementos.map((elemento) => {
          return page.evaluate((el) => {
            const companyName = el.querySelector("h2>span")?.textContent;
            const direccion = el.querySelector("span.location")?.textContent;
            const phone = el.querySelector("a.phone>span")?.textContent || null;
            const correos = el.querySelector("a.btn-amarillo")?.textContent;
            const website = el.querySelector("div.web-row>a.web")?.href.split("?utm")[0] || null;
            return {companyName, direccion, phone, website, correos};
          }, elemento);
        })
      );
    
      objetosDatos.push(...resultados);
    
      console.log("Entra en el siguiente botón");
      await Promise.allSettled([
        page.waitForSelector("ul.pagination>li>a", {timeout: 10000}),
        page.click(nextButton[i+1]),
        page.waitForSelector("div.listado-item", {waitUntil: "networkidle0", timeout: 60000}),
      ]);
    
      console.log("Página cargada");
      objetosDatos = [...new Set(objetosDatos)]; // Elimina duplicados
    }
    } catch (error) {
    console.log(error);
    }
    return objetosDatos;
  }
 

async function getEmails(datos:any) {
    if (datos.website === null) return Promise.resolve({...datos, correos: "false"});
  
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    try {
      await page.goto(datos.website, {waitUntil: "load"}); // timeout 5 segundos
  
  
      const bodyText = await page.evaluate(() => document.body.textContent);
      const emailRegex = /[\w\.-]+@[\w\.-]+\.[\w\.-]+/g;
      
      let emails = bodyText?.match(emailRegex)?.[0];
  
      if (!emails) {
        const aboutPage = `${datos.website}/nosotros`;
        await page.goto(aboutPage);
        const aboutText = await page.evaluate(() => document.body.textContent);
        const aboutEmails = aboutText?.match(emailRegex);
        if (aboutEmails) {
          emails = aboutEmails[0];
        } else {
          const contactPage = `${datos.website}/contacto`;
          await page.goto(contactPage);
          const contactText = await page.evaluate(() => document.body.textContent);
          const contactEmails = contactText?.match(emailRegex);
          if (contactEmails) {
            emails = contactEmails[0];
          } else {
            emails = "No se encontró el correo";
          }
        }
      }

      await browser.close();
      return {...datos, correos: emails ? emails : ""};
    } catch (error) {
      console.error(`Error al acceder al sitio web: ${datos.website}`);
      // /añadir el campo pagina erronea
      await browser.close();
      return datos = {...datos, paginaErronea: datos.website};
    }
  }

async function getEmailsParallel(arr:any) {
    const result = await Promise.map(arr, getEmails, {concurrency: 5});
    return result;
  }
