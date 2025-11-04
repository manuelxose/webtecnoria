import { Component, OnInit } from "@angular/core";
import { FeatherModule } from "angular-feather";

@Component({
  selector: "app-auth-signup",
  templateUrl: "./auth-signup.component.html",
  styleUrls: ["./auth-signup.component.css"],
  standalone: true,
  imports: [FeatherModule],
})

/**
 * Auth Signup Component
 */
export class AuthSignupComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
