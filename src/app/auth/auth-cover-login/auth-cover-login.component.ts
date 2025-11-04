import { Component, OnInit } from "@angular/core";
import { FeatherModule } from "angular-feather";

@Component({
  selector: "app-auth-cover-login",
  templateUrl: "./auth-cover-login.component.html",
  styleUrls: ["./auth-cover-login.component.css"],
  standalone: true,
  imports: [FeatherModule],
})

/**
 * Auth Cover-Login Component
 */
export class AuthCoverLoginComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
