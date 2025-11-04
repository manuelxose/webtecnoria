import { Component, OnInit } from "@angular/core";
import { FeatherModule } from "angular-feather";

@Component({
  selector: "app-auth-re-password",
  templateUrl: "./auth-re-password.component.html",
  styleUrls: ["./auth-re-password.component.css"],
  standalone: true,
  imports: [FeatherModule],
})

/**
 * Auth RePassword Component
 */
export class AuthRePasswordComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
