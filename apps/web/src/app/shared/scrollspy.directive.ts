import {
  Directive,
  Input,
  EventEmitter,
  Inject,
  Output,
  ElementRef,
  HostListener,
  PLATFORM_ID,
} from "@angular/core";
import { DOCUMENT, isPlatformBrowser } from "@angular/common";

@Directive({
  selector: "[appScrollspy]",
})
export class ScrollspyDirective {
  @Input() public spiedTags = [];
  @Output() public sectionChange = new EventEmitter<string>();
  private currentSection: string;
  private isBrowser: boolean;

  // tslint:disable-next-line: variable-name
  constructor(
    private _el: ElementRef,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  @HostListener("window:scroll", ["$event"])
  /**
   * Window scroll method
   */
  onScroll(event: any) {
    if (!this.isBrowser) {
      return;
    }

    let currentSection: string;
    const children = this._el.nativeElement.querySelectorAll("section");
    const scrollTop = this.document.documentElement.scrollTop;
    const parentOffset = this.document.documentElement.offsetTop;

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < children.length; i++) {
      const element = children[i];
      if (this.spiedTags.some((spiedTag) => spiedTag === element.tagName)) {
        if (element.offsetTop - parentOffset <= scrollTop) {
          currentSection = element.id;
        }
      }
    }
    if (currentSection !== this.currentSection) {
      this.currentSection = currentSection;
      this.sectionChange.emit(this.currentSection);
    }
  }
}
