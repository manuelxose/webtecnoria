// src/app/app.browser.module.ts
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppModule } from "./app.module";
import { AppComponent } from "./app.component";

// AngularFire modular (recomendado en v7+)
import { provideFirebaseApp } from "@angular/fire/app";
import { initializeApp } from "firebase/app";
import { provideAuth, getAuth } from "@angular/fire/auth";
import { provideFirestore, getFirestore } from "@angular/fire/firestore";

import { environment } from "../environments/environment";

@NgModule({
  imports: [
    // Imprescindible para error "renderModule[...] requires BrowserModule.withServerTransition"
    BrowserModule.withServerTransition({ appId: "web-empresa" }),
    AppModule,

    // Firebase SOLO en el navegador
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
  bootstrap: [AppComponent],
})
export class AppBrowserModule {}
