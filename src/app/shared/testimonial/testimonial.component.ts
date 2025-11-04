import { Component, OnInit, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CarouselComponent } from "../carousel/carousel.component";

@Component({
  selector: "app-testimonial",
  templateUrl: "./testimonial.component.html",
  styleUrls: ["./testimonial.component.css"],
  standalone: true,
  imports: [CommonModule, CarouselComponent],
})
export class TestimonialComponent implements OnInit {
  @Input() testimonialData: Array<{
    profile: string;
    message: string;
    name: string;
    designation: string;
  }>;

  // simplified carousel configuration compatible with app-carousel
  // include optional 'responsive' so templates that check it won't error
  customOptions: {
    loop: boolean;
    autoplay: boolean;
    interval: number;
    slidesToShow: number;
    responsive?: any;
  } = {
    loop: true,
    autoplay: true,
    interval: 5000,
    slidesToShow: 3,
  };

  constructor() {}

  ngOnInit(): void {}
}
