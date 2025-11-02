import { AngularFireModule } from "@angular/fire/compat";
import { AngularFirestoreModule } from "@angular/fire/compat/firestore";
import { AngularFireStorageModule } from "@angular/fire/compat/storage";
import { AngularFireFunctionsModule } from "@angular/fire/compat/functions";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { environment } from "src/environments/environment";
import { AppComponent } from "./app.component";
import { AppModule } from "./app.module";

// Importar módulos de Firebase Auth modular
import { provideFirebaseApp, initializeApp } from "@angular/fire/app";
import { provideAuth, getAuth } from "@angular/fire/auth";

@NgModule({
  imports: [
    BrowserAnimationsModule, // DEBE ir ANTES de BrowserModule.withServerTransition
    BrowserModule.withServerTransition({ appId: "web-empresa" }),
    AppModule,

    // Firebase compat SOLO en browser:
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireFunctionsModule,

    // Firebase Auth modular SOLO en browser (van en imports, no en providers)
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
  ],
  bootstrap: [AppComponent],
})
export class AppBrowserModule {}
