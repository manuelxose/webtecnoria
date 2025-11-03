import { Component, Input } from "@angular/core";

export interface ServiceData {
  icon: string;
  title: string;
  description: string;
  features: string[];
  cta?: {
    text: string;
    link: string;
  };
}

@Component({
  selector: "app-service-card",
  templateUrl: "./service-card.component.html",
  styleUrls: ["./service-card.component.css"],
})
export class ServiceCardComponent {
  @Input() service!: ServiceData;
  @Input() index: number = 0;
}
