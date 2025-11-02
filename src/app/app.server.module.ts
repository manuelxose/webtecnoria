// src/app/app.server.module.ts
import { NgModule } from "@angular/core";
import { ServerModule } from "@angular/platform-server";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { AppBrowserModule } from "./app.browser.module";
import { AppComponent } from "./app.component";

// Importar tokens para proporcionar mocks
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { AngularFireStorage } from "@angular/fire/compat/storage";
import { AngularFireFunctions } from "@angular/fire/compat/functions";
import { FIREBASE_OPTIONS } from "@angular/fire/compat";
import { Auth } from "@angular/fire/auth";

// Mock classes para SSR (vacías, solo para satisfacer la inyección)
class MockAngularFirestore {}
class MockAngularFireStorage {}
class MockAngularFireFunctions {}
class MockAuth {}

@NgModule({
  imports: [
    AppBrowserModule,
    ServerModule,
    NoopAnimationsModule, // Este debe estar DESPUÉS de AppBrowserModule para sobreescribir BrowserAnimationsModule
  ],
  providers: [
    // Proveer mocks para Firebase en el servidor
    { provide: AngularFirestore, useClass: MockAngularFirestore },
    { provide: AngularFireStorage, useClass: MockAngularFireStorage },
    { provide: AngularFireFunctions, useClass: MockAngularFireFunctions },
    { provide: Auth, useClass: MockAuth }, // Mock para Auth modular
    { provide: FIREBASE_OPTIONS, useValue: {} },
  ],
  bootstrap: [AppComponent],
})
export class AppServerModule {}
