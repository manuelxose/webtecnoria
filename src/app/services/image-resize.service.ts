import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageResizeService {


private screenWidth: number;

  constructor() {
    this.screenWidth = window.innerWidth;
    window.onresize = () => {
      this.screenWidth = window.innerWidth;
    };
  }

  getScreenWidth(): number {
    return this.screenWidth;
  }
}