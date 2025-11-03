import { Component, OnInit, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-member",
  templateUrl: "./member.component.html",
  styleUrls: ["./member.component.css"],
  standalone: true,
  imports: [CommonModule],
})
export class MemberComponent implements OnInit {
  @Input() memberData: Array<{
    profile: string;
    list?: Array<[]>;
    name: string;
    designation: string;
  }>;

  constructor() {}

  ngOnInit(): void {}
}
