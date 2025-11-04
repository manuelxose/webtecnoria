import { Component, OnInit } from "@angular/core";
import { FeatherModule } from "angular-feather";

@Component({
  selector: "app-auth-signup-three",
  templateUrl: "./auth-signup-three.component.html",
  styleUrls: ["./auth-signup-three.component.css"],
  standalone: true,
  imports: [FeatherModule],
})

/**
 * Auth Signup-three Component
 */
export class AuthSignupThreeComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
