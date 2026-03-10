import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { DOCUMENT, isPlatformBrowser } from "@angular/common";

@Injectable({ providedIn: "root" })
export class BrowserDomAdapter {
  readonly isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    @Inject(DOCUMENT) private readonly doc: Document
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  scrollToTop(): void {
    if (!this.isBrowser) return;
    window.scrollTo(0, 0);
  }

  scrollToId(id: string): void {
    if (!this.isBrowser) return;
    this.doc.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  getElementById(id: string): HTMLElement | null {
    if (!this.isBrowser) return null;
    return this.doc.getElementById(id);
  }

  queryAll(selector: string): NodeListOf<Element> | [] {
    if (!this.isBrowser) return [];
    return this.doc.querySelectorAll(selector);
  }

  appendSchema(data: unknown): void {
    if (!this.isBrowser) return;
    const script = this.doc.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(data);
    this.doc.head.appendChild(script);
  }
}
