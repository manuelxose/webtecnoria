import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { SitemapItemLoose } from 'sitemap/dist/lib/types';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { Observable } from 'rxjs';

const NOW = new Date().toISOString();

@Injectable({
  providedIn: 'root'
})


export class FirestoreService {


  private dbPath: string;
  private collRef: AngularFirestoreCollection<any>
  private queryPag:any;
  private queryFilter: any;


  constructor(  

    private db: AngularFirestore,
    private storage: AngularFireStorage,
    private functions: AngularFireFunctions
    
    ) {

      this.dbPath = "";


  }

  //SELECCIONAMOS LA COLECCION EN LA QUE TRABAJAMOS

  private setPath(name:string){
    return this.dbPath = name;
  }

  public setCollection(name:string){
    this.collRef = this.db.collection(this.setPath(name))
    return this;
  }

  // OBTENEMOS TODOS LOS DOCUMENTOS DE UNA COLECCION

  public getAll(){
    return this.collRef.get();
  }

  //OBTENEMOS UN DOCUMENTO

  public async getDoc(data:any){
    return await this.collRef.doc(data).get()
  }

  // CREA UN NUEVO DOCUMENTO EN UNA COLECCION;

  public createDoc(doc:any):any{
    return this.collRef.add({...doc})
  }
  

  //ACTUALIZA EL DOCUMENTO DE UNA COLECCIÓN

  public updateDoc(doc:any): Promise<void>{
    return this.collRef.doc(doc.id).update(doc)
  }

  //ELIMINA EL DOCUMENTO DE UNA COLECCIÓN

  public deleteDoc(doc:any){
    return this.collRef.doc(doc.id).delete();
  }



  ///FUNCIONES PARA PAGINACION (TEMPORAL)

    //SE OBTIENE LA PRIMERA CONSULATA DE PAGINACIÓN, OBTENEMOS ULTIMO DOCUMENTO;

  public async getPagination(limit:number){
    const pag = await this.collRef.ref.limit(limit).orderBy('price').get();
    this.queryPag = pag.docs[pag.docs.length - 1];

    return pag;
  }

  public  async nextPage(limit:number):Promise<any>{

    return  await this.collRef.ref
                .orderBy("price",'desc')
                .limit(limit)
                .startAfter(this.queryPag)
                .get()

  }

  public async prevPage(limit:number){

    return  await this.collRef.ref
    .orderBy("price",'desc')
    .limit(limit)
    .endBefore(this.queryPag)
    .get()
  }

  public setPagination(query:any){

    this.queryPag = query;

  }

  ///////SECCION PARA CREAR LOS FILTROS
  public setQuery(){

    this.queryFilter = this.collRef.ref;
    return this;

  }

  public getQuery(){

    return this.queryFilter;

  }

  public async filterArrayContains(field:string,data:string,limit:number){
    return await this.collRef.ref.where(field,"array-contains",data).limit(limit).get()
  }

  public async filterWhereEquals(field:string,data:string,limit:number){
    return await this.collRef.ref.where(field, '==',data).limit(limit).get()
  }

  public whereEquals(field:string,data:string){

     this.getQuery().where( field, '==', data )

  }
  public async filterMenorQue(field:string,data:string,limit:number){
    return await this.collRef.ref.where(field, '<=',data).limit(limit).get()
  }
  public async filterMayorQue(field:string,data:string,limit:number){
    return await this.collRef.ref.where(field, '>=',data).limit(limit).get()
  }
  public async caudalAltura(caudal:number,altura:number){
    return await this.collRef.ref.where('caracteristicas.caudal', '==',caudal).where('caracteristicas.altura','==',altura).get()

  }
  public async filterPrice(menor:number,mayor:number){
    console.log("holi" + menor + ' , ' + mayor);

    if(mayor == 0) mayor = 999999;
    var price: string = 'price';
    return await this.collRef.ref.where(price, '<=',mayor).where(price,'>=',menor).limit(10).get()
  }

//Subir imagenes del blog

  public uploadImageBlog(file:File, name:string):Promise<any>{
    return new Promise((resolve,reject)=>{

      const filePath = `blog/${name}`;
      const ref = this.storage.ref(filePath);
      const task = this.storage.upload(filePath,file);
      task.then(e=>{
        ref.getDownloadURL().subscribe(url=>{
          resolve(url);
          console.log(url, "url");
          
        })
      }).catch(error=>{
        reject(error);
      })
    })
  }

  public downloadImageBlog(name:string):Promise<any>{
    return new Promise((resolve,reject)=>{
      const filePath = `blog/${name}`;
      const ref = this.storage.ref(filePath);
      ref.getDownloadURL().subscribe(url=>{
        resolve(url);
      })
    })
  }

  public deleteImageBlog(name:string):Promise<any>{
    return new Promise((resolve,reject)=>{
      const filePath = `blog/${name}`;
      const ref = this.storage.ref(filePath);
      ref.delete().subscribe(url=>{
        resolve(url);
      })
    })
  }
  public async callFunction(name:string,data?:any):Promise<any>{
    //Esta funcion es para llamar a las funciones de firebase
    //tiene que permitir cors
    //llamar onCall desde otra region
    

    const functionsUrl = "http://192.168.1.100:5001/tecnoriaweb/europe-west1/companyScraper2";

    const url = name;
    
    fetch(`${functionsUrl}?url=${url}`)
      .then(response => response.json())
      .then(data => {
        console.log(data);
      })
      .catch(error => {
        console.error(error);
      });
  }

  async indexBlogPost(url: string): Promise<any> {
    const callable = this.functions.httpsCallable('indexBlogPost');
    const result = await callable({ url: url })
    //to promise esta en desuso sustituir por await
    console.log('Indexing result:', result);
    return result;
  }
}