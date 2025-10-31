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

async function scrapePage(url) {
  let objetoDatos:any = [];
  const browser = await puppeteer.launch({headless: false});
  const [page] = await browser.pages();
  
  await page.goto(url, {waitUntil: "networkidle0"});

  await page.$$eval("button", (elements) =>{
    if (elements !== undefined) Array.from(elements).find((el) => el.innerText === "Aceptar todo")?.click();
  } );

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
async function parsePlaces(page:any) {
    let objetoDatos:any = [];
    
    await page.evaluate(async () => {
        let fin:any = null;
        let element = document.querySelectorAll("div.m6QErb")[4];
        const distance = 500;
        let lastHeight;
    
        // Esperar a que el elemento esté completamente cargado
        await new Promise((resolve) => setTimeout(resolve, 5000));
    
        while (true) {
          element.scrollBy(0, distance);
    
    
          // await new Promise((resolve) => setTimeout(resolve, 3500));
          // si eement.scrollHeight es igual esperar 5 segundos y volver a comprobar
          if (element.scrollHeight === lastHeight) {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            if (element.scrollHeight === lastHeight) {
              if (document.querySelectorAll("span.HlvSq")[0] !== undefined) {
                fin = document.querySelectorAll("span.HlvSq")[0].innerHTML;
                console.log("El valor de fin es: " + fin);
                break;
              }
            }
          }
    
          console.log("Desplazado anterior: " + lastHeight + " Tamaño del desplazamiento: " + element.scrollHeight);
          lastHeight = element.scrollHeight;
        }
    
        console.log("Sale del bucle"+ fin);
      });

    let elementosNuevos = await page.$$("div.lI9IFe");
   
  
    console.log("Elementos nuevos al finalizar scroll", elementosNuevos.length);
  
    for (let i = 0; i < elementosNuevos.length; i += 1) {
      const element = elementosNuevos[i];
      if (element === null) continue;
  
      let website = null;
      const companyName = await (await element.$(".qBF1Pd span")).evaluate((node) => node.textContent).catch(() => null);
      const reviewCount = await element.$eval(".W4Efsd > div:nth-of-type(1) > span:nth-of-type(2)", (el) => el.innerText).catch(() => null);
      const phone = await element.$eval(".W4Efsd > div:nth-of-type(2) > span:nth-of-type(2)", (el) => el.innerText).catch(() => null);
      const cerrado = await element.$eval(".W4Efsd >div:nth-of-type(2) > span:nth-of-type(1)", (el) => el.innerText).catch(() => null);
      if (await element.$("a[href^=\"http\"]") !== null) website = await (await element.$("a[href^=\"http\"]")).evaluate((node) => node.getAttribute("href")).catch(() => null);
  
      const direccion = await element.$eval(".W4Efsd .W4Efsd:nth-of-type(1)", (el) => el.innerText).catch(() => null);
  
      objetoDatos.push({
        companyName,
        reviewCount,
        phone,
        website,
        direccion,
        cerrado,
      });
    }
  
    return objetoDatos;
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
