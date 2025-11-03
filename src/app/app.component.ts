import { Component } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { Router, NavigationEnd, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-root",
    imports: [CommonModule, RouterModule],
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"]
})
export class AppComponent {
  constructor(
    private router: Router,
    private meta: Meta,
    private title: Title
  ) {
    this.meta.addTags([
      { name: "author", content: "TecnoRia" },
      { name: "keywords", content: "marketing digital,diseño web,seo" },
      {
        name: "description",
        content: "Agencia de Marketing Digital en Galicia | TecnoRia",
      },
      { name: "robots", content: "index, follow" },
      { name: "date", content: "2023-03-07", scheme: "YYYY-MM-DD" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { httpEquiv: "Content-Type", content: "text/html" },
      { charset: "UTF-8" },
    ]);

    this.title.setTitle("Agencia de Marketing Digital en Galicia | TecnoRia");

    this.router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        // window['Unicons']();
      }

      if (!(event instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }

  ngOnInit() {}

  public setTitle(newTitle: string) {
    this.title.setTitle(newTitle);
  }
}
