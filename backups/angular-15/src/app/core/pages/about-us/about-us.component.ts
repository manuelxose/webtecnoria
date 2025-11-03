import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
  selector: "app-about-us",
  templateUrl: "./about-us.component.html",
  styleUrls: ["./about-us.component.css"],
  standalone: true,
  imports: [CommonModule],
})
export class AboutUsComponent {
  constructor() {}
}
