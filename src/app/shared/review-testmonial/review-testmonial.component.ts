import { Component, OnInit, Input } from "@angular/core";
import { CarouselComponent } from "../carousel/carousel.component";

@Component({
  selector: "app-review-testmonial",
  templateUrl: "./review-testmonial.component.html",
  styleUrls: ["./review-testmonial.component.css"],
  standalone: true,
  imports: [CarouselComponent],
})
export class ReviewTestmonialComponent implements OnInit {
  @Input() reviewData: Array<{
    profile: string;
    message: number;
    name: string;
    designation: string;
  }>;

  // new carousel configuration (used in template binding)
  public carouselConfig = {
    loop: true,
    autoplay: true,
    interval: 5000,
    pauseOnHover: true,
    slidesToShow: 1,
  };

  constructor() {}

  ngOnInit(): void {}
}
