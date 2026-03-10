import { CommonModule, DOCUMENT, isPlatformBrowser } from "@angular/common";
import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  inject,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterModule } from "@angular/router";
import {
  primaryNavigation,
  SITE_EMAIL,
  SITE_NAME,
  SITE_PHONE,
  SITE_PHONE_LABEL,
} from "../content/site-content";

@Component({
  selector: "app-site-header",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./site-header.component.html",
  styleUrls: ["./site-header.component.css"],
})
export class SiteHeaderComponent implements OnDestroy {
  private static readonly INLINE_NAV_BREAKPOINT = 1440;

  @ViewChild("menuButton")
  private readonly menuButton?: ElementRef<HTMLButtonElement>;

  @ViewChild("drawerCloseButton")
  private readonly drawerCloseButton?: ElementRef<HTMLButtonElement>;

  readonly navigation = primaryNavigation;
  readonly siteName = SITE_NAME;
  readonly phone = SITE_PHONE;
  readonly phoneLabel = SITE_PHONE_LABEL;
  readonly email = SITE_EMAIL;
  readonly menuPanelId = "site-header-drawer";

  menuOpen = false;

  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser: boolean;

  constructor(
    private readonly router: Router,
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.closeMenu(false);
        }
      });
  }

  toggleMenu(): void {
    if (this.menuOpen) {
      this.closeMenu();
      return;
    }

    this.menuOpen = true;
    this.syncBodyScroll();

    if (this.isBrowser) {
      queueMicrotask(() => this.drawerCloseButton?.nativeElement.focus());
    }
  }

  closeMenu(restoreFocus = true): void {
    if (!this.menuOpen) {
      return;
    }

    this.menuOpen = false;
    this.syncBodyScroll();

    if (restoreFocus && this.isBrowser) {
      queueMicrotask(() => this.menuButton?.nativeElement.focus());
    }
  }

  closeMenuAndFollow(): void {
    this.closeMenu(false);
  }

  @HostListener("document:keydown", ["$event"])
  handleDocumentKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape" && this.menuOpen) {
      event.preventDefault();
      this.closeMenu();
    }
  }

  @HostListener("window:resize")
  handleWindowResize(): void {
    if (!this.isBrowser || !this.menuOpen) {
      return;
    }

    if (window.innerWidth >= SiteHeaderComponent.INLINE_NAV_BREAKPOINT) {
      this.closeMenu(false);
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      this.document.body.classList.remove("site-menu-open");
    }
  }

  private syncBodyScroll(): void {
    if (!this.isBrowser) {
      return;
    }

    this.document.body.classList.toggle("site-menu-open", this.menuOpen);
  }
}
