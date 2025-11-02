import { AngularFireModule } from "@angular/fire/compat";
import { AngularFirestoreModule } from "@angular/fire/compat/firestore";
import { AngularFireStorageModule } from "@angular/fire/compat/storage";
import { AngularFireFunctionsModule } from "@angular/fire/compat/functions";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { environment } from "src/environments/environment";
import { AppComponent } from "./app.component";
import { AppModule } from "./app.module";

@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: "web-empresa" }),
    AppModule,

    // Firebase compat SOLO en browser:
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireFunctionsModule,
  ],
  bootstrap: [AppComponent],
})
export class AppBrowserModule {}
