// src/app/app.server.module.ts
import { NgModule } from "@angular/core";
import { ServerModule } from "@angular/platform-server";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { AppModule } from "./app.module";
import { AppComponent } from "./app.component";

@NgModule({
  imports: [
    AppModule,
    ServerModule,
    NoopAnimationsModule, // evita warnings de animaciones en SSR
  ],
  bootstrap: [AppComponent],
})
export class AppServerModule {}
