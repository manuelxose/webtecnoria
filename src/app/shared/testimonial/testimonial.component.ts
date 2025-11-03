import { Component, OnInit, Input } from "@angular/core";
import { OwlOptions } from "ngx-owl-carousel-o";

@Component({
    selector: "app-testimonial",
    templateUrl: "./testimonial.component.html",
    styleUrls: ["./testimonial.component.css"],
    imports: []
})
export class TestimonialComponent implements OnInit {
  @Input() testimonialData: Array<{
    profile: string;
    message: number;
    name: string;
    designation: string;
  }>;

  /***
   * Client Owl Slider
   */
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ["", ""],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 2,
      },
      740: {
        items: 3,
      },
      940: {
        items: 4,
      },
    },
    nav: false,
  };

  constructor() {}

  ngOnInit(): void {}
}
