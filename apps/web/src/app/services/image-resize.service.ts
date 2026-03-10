import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

@Injectable({
  providedIn: "root",
})
export class ImageResizeService {
  private screenWidth: number;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      this.screenWidth = window.innerWidth;
      window.onresize = () => {
        this.screenWidth = window.innerWidth;
      };
    } else {
      // Default value for SSR
      this.screenWidth = 1920;
    }
  }

  getScreenWidth(): number {
    return this.screenWidth;
  }
}
