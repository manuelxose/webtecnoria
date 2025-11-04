import { Component, OnInit } from "@angular/core";
import { FeatherModule } from "angular-feather";

@Component({
  selector: "app-auth-cover-signup",
  templateUrl: "./auth-cover-signup.component.html",
  styleUrls: ["./auth-cover-signup.component.css"],
  standalone: true,
  imports: [FeatherModule],
})

/**
 * Auth Cover-Signup Component
 */
export class AuthCoverSignupComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
