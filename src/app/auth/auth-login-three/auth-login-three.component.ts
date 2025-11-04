import { Component, OnInit } from "@angular/core";
import { FeatherModule } from "angular-feather";

@Component({
  selector: "app-auth-login-three",
  templateUrl: "./auth-login-three.component.html",
  styleUrls: ["./auth-login-three.component.css"],
  standalone: true,
  imports: [FeatherModule],
})

/**
 * Auth Login-Three Component
 */
export class AuthLoginThreeComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
