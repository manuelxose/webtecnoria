import {
  Directive,
  Input,
  HostListener,
  Inject,
  PLATFORM_ID,
} from "@angular/core";
import { DOCUMENT, isPlatformBrowser } from "@angular/common";

@Directive({
  // support both the new name and the previous library attribute so templates don't need editing
  selector: "[appScrollTo],[ngxScrollTo]",
  standalone: true,
})
export class ScrollToDirective {
  /**
   * Accepts a CSS selector string (eg. '#contacto' or '.foo') or an HTMLElement.
   * Usage: <a [appScrollTo]="'#contacto'"> or legacy <a [ngxScrollTo]="'#contacto'">
   */
  public target: string | HTMLElement;
  @Input("appScrollTo") set appTarget(v: string | HTMLElement) {
    this.target = v;
  }
  @Input("ngxScrollTo") set ngxTarget(v: string | HTMLElement) {
    this.target = v;
  }
  /** Optional offset in pixels to subtract from target position */
  @Input() public offset = 0;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  @HostListener("click", ["$event"])
  onClick(event: Event) {
    // Only execute in browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Prevent default anchor navigation when using directive
    try {
      event.preventDefault();
    } catch (_) {}

    let el: HTMLElement | null = null;
    if (!this.target) {
      return;
    }

    if (typeof this.target === "string") {
      el = this.document.querySelector(this.target) as HTMLElement | null;
    } else if (this.target instanceof HTMLElement) {
      el = this.target;
    }

    if (!el) {
      return;
    }

    const top =
      el.getBoundingClientRect().top +
      window.pageYOffset -
      (Number(this.offset) || 0);
    window.scrollTo({ top, behavior: "smooth" });
  }
}
