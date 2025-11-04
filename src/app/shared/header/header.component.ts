import {
  Component,
  OnInit,
  Input,
  TemplateRef,
  Inject,
  PLATFORM_ID,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { Router, NavigationEnd } from "@angular/router";
import { NgbModal, NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
  standalone: true,
  imports: [CommonModule],
})

/***
 * Header Component
 */
export class HeaderComponent implements OnInit {
  @Input() navClass: string;
  @Input() buttonList: boolean;
  @Input() sliderTopbar: boolean;
  @Input() isdeveloper: boolean;
  @Input() shopPages: boolean;
  @Input() Settingicon: boolean;
  @Input() appicons: boolean;
  @Input() Nfticons: boolean;
  @Input() Menuoption: string;

  public href: string = "";
  private isBrowser: boolean;

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private offcanvasService: NgbOffcanvas,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        this._activateMenuDropdown();
      }
    });
  }

  isCondensed = false;

  ngAfterViewInit() {
    if (this.isBrowser) {
      setTimeout(() => {
        this._activateMenuDropdown();
      }, 0);
    }
  }

  ngOnInit(): void {
    this.href = this.router.url;

    if (!this.isBrowser) {
      return;
    }

    if (this.router.url == "/index-classic-saas") {
      var light_btn = document.querySelectorAll(".login-btn-primary");
      light_btn.forEach((element) => {
        (element as HTMLElement).style.display = "none";
      });

      var dark_btn = document.querySelectorAll(".login-btn-light");
      dark_btn.forEach((element) => {
        (element as HTMLElement).style.display = "block";
      });
    } else if (this.router.url == "/index-apps") {
      document.querySelector(".app-header").classList.remove("d-none");
    } else {
      var light_btn = document.querySelectorAll(".login-btn-primary");
      light_btn.forEach((element) => {
        (element as HTMLElement).style.display = "block";
      });

      var dark_btn = document.querySelectorAll(".login-btn-light");
      dark_btn.forEach((element) => {
        (element as HTMLElement).style.display = "none";
      });
    }

    setTimeout(() => {
      this._activateMenuDropdown();
    }, 0);
  }

  _activateMenuDropdown() {
    if (!this.isBrowser) {
      return;
    }

    /**
     * Menu activation reset
     */
    const resetParent = (el) => {
      el.classList.remove("active");
      const parent = el.parentElement;

      /**
       * TODO: This is hard coded way of expading/activating parent menu dropdown and working till level 3.
       * We should come up with non hard coded approach
       */
      if (parent) {
        parent.classList.remove("active");
        const parent2 = parent.parentElement;
        if (parent2) {
          parent2.classList.remove("active");
          const parent3 = parent2.parentElement;
          if (parent3) {
            parent3.classList.remove("active");
            const parent4 = parent3.parentElement;
            if (parent4) {
              const parent5 = parent4.parentElement;
              parent5.classList.remove("active");
            }
          }
        }
      }
    };
    let links = document.getElementsByClassName("nav-link-ref");
    let matchingMenuItem = null;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < links.length; i++) {
      // reset menu
      resetParent(links[i]);
    }
    for (let i = 0; i < links.length; i++) {
      if (window.location.pathname === links[i]["pathname"]) {
        matchingMenuItem = links[i];
        break;
      }
    }

    if (matchingMenuItem) {
      matchingMenuItem.classList.add("active");
      const parent = matchingMenuItem.parentElement;

      /**
       * TODO: This is hard coded way of expading/activating parent menu dropdown and working till level 3.
       * We should come up with non hard coded approach
       */
      if (parent) {
        parent.classList.add("active");
        const parent2 = parent.parentElement;
        if (parent2) {
          parent2.classList.add("active");
          const parent3 = parent2.parentElement;
          if (parent3) {
            parent3.classList.add("active");
            const parent4 = parent3.parentElement;
            if (parent4) {
              const parent5 = parent4.parentElement;
              parent5.classList.add("active");

              document.getElementById("navigation").style.display = "none";
              this.isCondensed = false;
            }
          }
        }
      }
    }
  }

  /**
   * Window scroll method
   */
  // tslint:disable-next-line: typedef
  windowScroll() {
    if (!this.isBrowser) {
      return;
    }

    if (
      document.body.scrollTop > 50 ||
      document.documentElement.scrollTop > 50
    ) {
      document.getElementById("topnav").classList.add("nav-sticky");
    } else {
      document.getElementById("topnav").classList.remove("nav-sticky");
    }
    if (document.getElementById("back-to-top")) {
      if (
        document.body.scrollTop > 100 ||
        document.documentElement.scrollTop > 100
      ) {
        document.getElementById("back-to-top").style.display = "inline";
      } else {
        document.getElementById("back-to-top").style.display = "none";
      }
    }
  }
  /**
   * Toggle menu
   */
  toggleMenu() {
    if (!this.isBrowser) {
      return;
    }

    this.isCondensed = !this.isCondensed;
    if (this.isCondensed) {
      document.getElementById("navigation").style.display = "block";
    } else {
      document.getElementById("navigation").style.display = "none";
    }
  }

  /**
   * Menu clicked show the submenu
   */
  onMenuClick(event) {
    event.preventDefault();
    const nextEl = event.target.nextSibling.nextSibling;
    if (nextEl && !nextEl.classList.contains("open")) {
      const parentEl = event.target.parentNode;
      if (parentEl) {
        parentEl.classList.remove("open");
      }
      nextEl.classList.add("open");
    } else if (nextEl) {
      nextEl.classList.remove("open");
    }
    return false;
  }

  developerModal(content) {
    this.modalService.open(content, { size: "lg", centered: true });
  }

  wishListModal(content) {
    this.modalService.open(content, { centered: true });
  }

  // Demo Offcanvas
  openright(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { position: "end" });
  }
}
