import { Component, OnInit, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.css"],
  standalone: true,
  imports: [CommonModule],
})

/***
 * Footer Component
 */
export class FooterComponent implements OnInit {
  @Input() footerVariant: string;
  @Input() hideFooter: boolean;

  //Get Year
  year = new Date().getFullYear();

  constructor() {}

  ngOnInit(): void {}
}
