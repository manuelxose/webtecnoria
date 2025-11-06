import { Injectable, Inject, PLATFORM_ID, Optional } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { Observable, of } from "rxjs";
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from "@angular/fire/compat/firestore";
import { AngularFireStorage } from "@angular/fire/compat/storage";
import { AngularFireFunctions } from "@angular/fire/compat/functions";

@Injectable({ providedIn: "root" })
export class FirestoreService {
  private readonly isBrowser: boolean;

  private dbPath = "";
  private collRef?: AngularFirestoreCollection<any>;
  private queryPag: any;
  private queryFilter: firebase.default.firestore.Query | undefined;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    @Optional() private db: AngularFirestore | null,
    @Optional() private storage: AngularFireStorage | null,
    @Optional() private functions: AngularFireFunctions | null
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // Helpers
  private setPath(name: string) {
    this.dbPath = name;
    return this.dbPath;
  }

  public setCollection(name: string) {
    if (!this.isBrowser || !this.db) {
      this.collRef = undefined;
      return this;
    }
    this.collRef = this.db.collection(this.setPath(name));
    return this;
  }

  // CRUD
  // Return an Observable so callers can `subscribe()`.
  public getAll(): Observable<any> {
    if (!this.isBrowser || !this.collRef) return of({ docs: [] });
    // AngularFire compat collection.get() returns an Observable<QuerySnapshot>.
    // Cast through 'unknown' to resolve RxJS version conflicts between @angular/fire and main project
    return this.collRef.get() as unknown as Observable<any>;
  }

  public async getDoc(id: string) {
    if (!this.isBrowser || !this.collRef) return null;
    return await this.collRef.doc(id).get().toPromise();
  }

  public createDoc(doc: any): any {
    if (!this.isBrowser || !this.collRef) return Promise.resolve(null);
    return this.collRef.add({ ...doc });
  }

  public updateDoc(doc: any): Promise<void> {
    if (!this.isBrowser || !this.collRef) return Promise.resolve();
    return this.collRef.doc(doc.id).update(doc);
  }

  public deleteDoc(doc: any) {
    if (!this.isBrowser || !this.collRef) return Promise.resolve();
    return this.collRef.doc(doc.id).delete();
  }

  // Paginación (ejemplo)
  public async getPagination(limit: number) {
    if (!this.isBrowser || !this.collRef) return { docs: [] };
    const pag = await this.collRef.ref.orderBy("price").limit(limit).get();
    this.queryPag = pag.docs[pag.docs.length - 1];
    return pag;
  }

  public async nextPage(limit: number): Promise<any> {
    if (!this.isBrowser || !this.collRef || !this.queryPag) return { docs: [] };
    return await this.collRef.ref
      .orderBy("price", "desc")
      .limit(limit)
      .startAfter(this.queryPag)
      .get();
  }

  public async prevPage(limit: number) {
    if (!this.isBrowser || !this.collRef || !this.queryPag) return { docs: [] };
    return await this.collRef.ref
      .orderBy("price", "desc")
      .limit(limit)
      .endBefore(this.queryPag)
      .get();
  }

  public setPagination(query: any) {
    this.queryPag = query;
  }

  // Filtros
  public setQuery() {
    if (this.isBrowser && this.collRef) {
      this.queryFilter = this.collRef.ref;
    } else {
      this.queryFilter = undefined;
    }
    return this;
  }

  public getQuery() {
    return this.queryFilter;
  }

  public async filterArrayContains(field: string, data: string, limit: number) {
    if (!this.isBrowser || !this.collRef) return { docs: [] };
    return await this.collRef.ref
      .where(field, "array-contains", data)
      .limit(limit)
      .get();
  }

  public async filterWhereEquals(field: string, data: string, limit: number) {
    if (!this.isBrowser || !this.collRef) return { docs: [] };
    return await this.collRef.ref.where(field, "==", data).limit(limit).get();
  }

  public whereEquals(field: string, data: string) {
    if (this.isBrowser && this.queryFilter) {
      this.queryFilter = this.queryFilter.where(field, "==", data);
    }
  }

  public async filterMenorQue(field: string, data: any, limit: number) {
    if (!this.isBrowser || !this.collRef) return { docs: [] };
    return await this.collRef.ref.where(field, "<=", data).limit(limit).get();
  }

  public async filterMayorQue(field: string, data: any, limit: number) {
    if (!this.isBrowser || !this.collRef) return { docs: [] };
    return await this.collRef.ref.where(field, ">=", data).limit(limit).get();
  }

  public async caudalAltura(caudal: number, altura: number) {
    if (!this.isBrowser || !this.collRef) return { docs: [] };
    return await this.collRef.ref
      .where("caracteristicas.caudal", "==", caudal)
      .where("caracteristicas.altura", "==", altura)
      .get();
  }

  public async filterPrice(menor: number, mayor: number) {
    if (!this.isBrowser || !this.collRef) return { docs: [] };
    if (mayor === 0) mayor = 999_999;
    const price = "price";
    return await this.collRef.ref
      .where(price, "<=", mayor)
      .where(price, ">=", menor)
      .limit(10)
      .get();
  }

  // Storage (solo browser)
  public uploadImageBlog(file: File, name: string): Promise<any> {
    if (!this.isBrowser || !this.storage) return Promise.resolve(null);
    return new Promise((resolve, reject) => {
      const filePath = `blog/${name}`;
      const ref = this.storage!.ref(filePath);
      const task = this.storage!.upload(filePath, file);
      task
        .then(() => {
          ref.getDownloadURL().subscribe({
            next: (url) => resolve(url),
            error: (e) => reject(e),
          });
        })
        .catch(reject);
    });
  }

  public downloadImageBlog(name: string): Promise<any> {
    if (!this.isBrowser || !this.storage) return Promise.resolve(null);
    return new Promise((resolve) => {
      const ref = this.storage!.ref(`blog/${name}`);
      ref.getDownloadURL().subscribe((url) => resolve(url));
    });
  }

  public deleteImageBlog(name: string): Promise<any> {
    if (!this.isBrowser || !this.storage) return Promise.resolve(null);
    return new Promise((resolve) => {
      const ref = this.storage!.ref(`blog/${name}`);
      ref.delete().subscribe((res) => resolve(res));
    });
  }

  // Cloud Functions (solo browser)
  async indexBlogPost(url: string): Promise<any> {
    if (!this.isBrowser || !this.functions) return null;
    const callable = this.functions.httpsCallable("indexBlogPost");
    const result = await callable({ url });
    return result;
  }

  // Ejemplo fetch a una función HTTP — NO en SSR
  public async callFunction(name: string, data?: any): Promise<any> {
    if (!this.isBrowser) return null;
    const functionsUrl =
      "http://192.168.1.100:5001/tecnoriaweb/europe-west1/companyScraper2";
    const url = name;
    const res = await fetch(`${functionsUrl}?url=${encodeURIComponent(url)}`);
    return await res.json();
  }
}
