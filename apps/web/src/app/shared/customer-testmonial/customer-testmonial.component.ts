import { CommonModule } from "@angular/common";
import { Component, OnInit, Input } from "@angular/core";
import { CarouselComponent } from "src/app/shared/carousel/carousel.component";

@Component({
  selector: "app-customer-testmonial",
  templateUrl: "./customer-testmonial.component.html",
  styleUrls: ["./customer-testmonial.component.css"],
  standalone: true,
  imports: [CommonModule, CarouselComponent],
})
export class CustomerTestmonialComponent implements OnInit {
  @Input() customerData: Array<{
    image: string;
    designation: string;
    name: string;
    message?: string;
  }>;

  // simplified carousel config mapped from previous OwlOptions
  slidesToShow = 3;
  autoplay = true;
  interval = 3000;
  loop = true;

  constructor() {}

  ngOnInit(): void {}
}
