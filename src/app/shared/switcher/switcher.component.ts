import { Component, OnInit, Inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

@Component({
  selector: "app-switcher",
  templateUrl: "./switcher.component.html",
  styleUrls: ["./switcher.component.css"],
  imports: [],
})

/**
 * Switcher component
 */
export class SwitcherComponent implements OnInit {
  // set variable
  isVisible: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    // assign value
    this.isVisible = false;
  }

  /**
   * Change theme color
   */
  onChangeColor(color: string) {
    if (!isPlatformBrowser(this.platformId)) return;

    document
      .getElementById("color-opt")
      .setAttribute("href", "./assets/css/colors/" + color + ".css");
  }

  /**
   * Set dark theme
   */
  setDark() {
    if (!isPlatformBrowser(this.platformId)) return;

    document
      .getElementById("theme-opt")
      .setAttribute("href", "./assets/css/style-dark.min.css");
  }

  /**
   * Set light theme
   */
  setLight() {
    if (!isPlatformBrowser(this.platformId)) return;

    document
      .getElementById("theme-opt")
      .setAttribute("href", "./assets/css/style.min.css");
  }

  /**
   * Set dark-rtl theme
   */
  darkRtl() {
    if (!isPlatformBrowser(this.platformId)) return;

    document
      .getElementById("theme-opt")
      .setAttribute("href", "./assets/css/style-dark-rtl.min.css");
  }
  /**
   * Set dark-light theme
   */
  darkLtr() {
    if (!isPlatformBrowser(this.platformId)) return;

    document
      .getElementById("theme-opt")
      .setAttribute("href", "./assets/css/style-dark.min.css");
  }
  /**
   * Set rtl theme
   */
  setRtl() {
    if (!isPlatformBrowser(this.platformId)) return;

    document
      .getElementById("theme-opt")
      .setAttribute("href", "./assets/css/style-rtl.min.css");
  }
  /**
   * Set light theme
   */
  setLtr() {
    if (!isPlatformBrowser(this.platformId)) return;

    document
      .getElementById("theme-opt")
      .setAttribute("href", "./assets/css/style.min.css");
  }

  /**
   * Toggle switcher
   */
  onChangeSwitch() {
    this.isVisible = !this.isVisible;
  }
}
