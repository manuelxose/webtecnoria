import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

function _window(platformId: Object): any {
  return isPlatformBrowser(platformId) ? window : {};
}

@Injectable({
  providedIn: "root",
})
export class WindowRef {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  get nativeWindow(): any {
    return _window(this.platformId);
  }
}
