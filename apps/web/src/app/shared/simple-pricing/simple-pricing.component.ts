import { Component, OnInit, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-simple-pricing",
    templateUrl: "./simple-pricing.component.html",
    styleUrls: ["./simple-pricing.component.css"],
      standalone: true,
  imports: [
    CommonModule,]
})
export class SimplePricingComponent implements OnInit {
  @Input() simple_pricingData: Array<{
    warning?: string;
    title: string;
    price: number;
    list?: Array<[]>;
    btn?: string;
  }>;

  constructor() {}

  ngOnInit(): void {}
}
