import { Component, OnInit, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-pricing",
    templateUrl: "./pricing.component.html",
    styleUrls: ["./pricing.component.css"],
    imports: [CommonModule]
})
export class PricingComponent implements OnInit {
  @Input() pricingData: Array<{
    warning?: string;
    title: string;
    price: number;
    list?: Array<[]>;
    btn?: string;
  }>;

  constructor() {}

  ngOnInit(): void {}
}
