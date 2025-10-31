import { Injectable } from '@angular/core';
import pMap from 'p-map';
import puppeteer from 'puppeteer';


@Injectable({
  providedIn: 'root'
})
export class RastreoService {
  
  query = ''
  url= '';
  objetoDatos = [];

  constructor() { }


  async ngOnInit(): Promise<void> {}


  // async startSearch(query: string) {
   
  //   this.query = query;
  //   this.url = `https://www.google.com/maps/search/${this.query}`; 
  //   this.objetoDatos = [];


  //   const browser = await puppeteer.launch({ headless: false });
  //   const [page] = await browser.pages();


  //   await page.goto(this.url);
    
  //   //aceptar cookies

  //   await page.$$eval("button", (elements) =>
  //       Array.from(elements).find((el) => el.innerText === "Aceptar todo").click()
  //   );
  //   await page.waitForNavigation();


   
  //   await page.waitForNavigation({ waitUntil: 'networkidle0' }).then(async () => {
  //    this.objetoDatos = await this.parsePlaces(page)
  //   });

    
  //   console.log(this.objetoDatos);

  //   await browser.close();

  //    await this.getEmailsParallel(this.objetoDatos).then((result) => {
  //       console.log(result);
  //   }).catch((err) => {
  //       console.log(err);
  //   });

  // }


  // async parsePlaces(page) {

  //     let objetoDatos = [];
  //     const contenedorScroll = 'div.m6QErb.DxyBCb.kA9KIf.dS8AEf.ecceSd';
    
  //     await page.waitForSelector(contenedorScroll);

  //     let elementosAnteriores = [];
  //     let elementosNuevos = await page.$$('div.lI9IFe');

  //     while (elementosNuevos.length < 200) {
        

  //       elementosAnteriores = elementosNuevos;

  //       await page.evaluate(async () => {

  //         const element = await document.querySelectorAll('div.m6QErb')[4];
  //         let distance = 300;
  //         let currentHeight = 0;

  //         while (currentHeight + window.innerHeight < element.scrollHeight) {
  //           element.scrollBy(0, distance);
  //           currentHeight += distance;
  //           await new Promise(resolve => setTimeout(resolve, 1400));
  //         }

  //       });
          
  //       elementosNuevos = await page.$$('div.lI9IFe');
  //       await page.waitForTimeout(2000);
        
  //       console.log(elementosNuevos.length);

  //       if (elementosNuevos.length === elementosAnteriores.length) {
  //         break;
  //       }

  //     }
  //   console.log('Sale del scroll');
  //     for (let i = 0; i < elementosNuevos.length; i += 1) {
  //       const element = elementosNuevos[i];
  //       let website = null;
  //       const companyName = await (await element.$('.qBF1Pd span')).evaluate(node => node.textContent).catch(() => null);
  //       const reviewCount = await element.$eval('.W4Efsd > div:nth-of-type(1) > span:nth-of-type(2)', el => el.innerText).catch(() => null);
  //       const phone = await element.$eval('.W4Efsd > div:nth-of-type(2) > span:nth-of-type(2)', el => el.innerText).catch(() => null);
  //       if (await element.$('a[href^="http"]') !== null) website = await (await element.$('a[href^="http"]')).evaluate(node => node.getAttribute('href')).catch(() => null);
  //       const direccion = await element.$eval('.W4Efsd .W4Efsd:nth-of-type(1)', el => el.innerText).catch(() => null);
    
  //       objetoDatos.push({
  //         companyName,
  //         reviewCount,
  //         phone,
  //         website,
  //         direccion
  //       });
  //     }
    
  //     return objetoDatos;
  // }
    

  // async getEmails(datos) {

  //   if(datos.website === null) return Promise.resolve({ ...datos, correos:[] });

  //     const browser = await puppeteer.launch({ headless: false });
  //     const page = await browser.newPage();
    
  //     try {

  //       await page.goto(datos.website, { waitUntil: 'networkidle0' });

  //       const bodyText = await page.evaluate(() => document.body.textContent);
  //       const emailRegex = /[\w\.-]+@[\w\.-]+\.[\w\.-]+/g;
  //       let emails = bodyText.match(emailRegex);

  //   if (!emails) {
  //       const aboutPage = `${datos.website}/nosotros`;
  //       await page.goto(aboutPage);
  //       const aboutText = await page.evaluate(() => document.body.textContent);
  //       const aboutEmails = aboutText.match(emailRegex);
        
  //       if (aboutEmails) {
  //         emails = aboutEmails;
  //       } else {
  //           const contactPage = `${datos.website}/contacto`;
  //           await page.goto(contactPage);
  //           const contactText = await page.evaluate(() => document.body.textContent);
  //           const contactEmails = contactText.match(emailRegex);
  //           if (contactEmails) {
  //             emails = contactEmails;
  //           }
  //         }
  //   }

  //     await browser.close();
  //     return { ...datos, correos:emails };


  //   } catch (error) {
  //     console.error(`Error al acceder al sitio web: ${datos.website}`);
  //     ///añadir el campo pagina erronea
  //     datos = { ...datos, paginaErronea: true };
  //     await browser.close();
  //   }


  // }


  // async getEmailsParallel(arr){
  //       const result = await pMap(arr, this.getEmails, { concurrency: 5 });
  //       return result;
  // }

}